import { Injectable } from '@angular/core';
import { ApolloQueryResult } from '@apollo/client/core/types';
import { Apollo, gql } from 'apollo-angular';
import { map } from 'rxjs/operators';
import { Movie } from './movie';

interface SearchMovieResult {
  searchMovies: Movie[];
}

interface RandomMovieResult {
  randomMovie: Movie;
}

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  constructor(
    private apollo: Apollo
  ) { }

  searchMovieDirector(query: string) {
    return this.apollo.query({
      query: gql`
        query($query: String) {
          searchMovies(input: { field: "director", query: $query }) {
            director
          }
        }
      `,
      variables: { query }
    }).pipe(map((result) =>
      (result.data as SearchMovieResult).searchMovies.map((movie) => movie.director)
    ));
  }

  searchMovieWriter(query: string) {
    return this.apollo.query({
      query: gql`
        query($query: String) {
          searchMovies(input: { field: "writer", query: $query }) {
            writer
          }
        }
      `,
      variables: { query }
    }).pipe(map((result) =>
      (result.data as SearchMovieResult).searchMovies.map((movie) => movie.writer)
    ));
  }

  searchMovieStar(query: string) {
    return this.apollo.query({
      query: gql`
        query($query: String) {
          searchMovies(input: { field: "star", query: $query }) {
            star
          }
        }
      `,
      variables: { query }
    }).pipe(map((result) =>
      (result.data as SearchMovieResult).searchMovies.map((movie) => movie.star)
    ));
  }

  searchMovieByTitle(query: string) {
    return this.apollo.query({
      query: gql`
        query($query: String) {
          searchMovies(input: { field: "name", query: $query }) {
            name
            rating
            genre
            director
            writer
            star
            country
            company
            runtime
            year
            released
            budget
          }
        }
      `,
      variables: { query }
    }).pipe(map((result) =>
      (result.data as SearchMovieResult).searchMovies));
  }

  getRandomMovie() {
    return this.apollo.query({
      fetchPolicy: 'no-cache',
      query: gql`
        query {
          randomMovie {
            budget
            company
            country
            director
            genre
            name
            rating
            released
            runtime
            score
            star
            writer
            year
          }
        }
      `
    }).pipe(map((result) => (result as ApolloQueryResult<RandomMovieResult>).data.randomMovie));
  }
}
