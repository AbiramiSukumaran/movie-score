import {NgModule} from '@angular/core';
import {ApolloModule, APOLLO_OPTIONS} from 'apollo-angular';
import {ApolloClientOptions, InMemoryCache} from '@apollo/client/core';
import {HttpLink} from 'apollo-angular/http';
import * as Realm from "realm-web";
import { setContext } from '@apollo/client/link/context';
import { environment } from './../environments/environment';

const { GRAPHQL_URI, REALM_APP_ID } = environment;

if (!REALM_APP_ID) {
  throw new Error('Missing environment variable: REALM_APP_ID');
}

const app = new Realm.App(REALM_APP_ID);

// Gets a valid Realm user access token to authenticate requests
async function getValidAccessToken() {
  // Guarantee that there's a logged in user with a valid access token
  if (!app.currentUser) {
    // If no user is logged in, log in using the API key
    const credentials = Realm.Credentials.anonymous();
    await app.logIn(credentials);
  } else {
    // An already logged in user's access token might be stale. To guarantee that the token is
    // valid, we refresh the user's custom data which also refreshes their access token.
    await app.currentUser.refreshCustomData();
  }
  return app.currentUser! .accessToken;
}

export function createApollo(httpLink: HttpLink): ApolloClientOptions<any> {
    if (!GRAPHQL_URI) {
      throw new Error('Missing environment variable: GRAPHQL_URI');
    }

    const http = httpLink.create({ uri: GRAPHQL_URI });

    // Create a new ApolloLink that appends the access token to the headers of each GraphQL request.
    const auth = setContext(async () => {
      let token;
      try {
        token = await getValidAccessToken();
      } catch (e) {
        throw new Error(`No valid access token found. ${e}`);
      }
    
      return {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
    });

    const link = auth.concat(http);

    return {
      link,
      cache: new InMemoryCache(),
    };
}


@NgModule({
  exports: [ApolloModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
