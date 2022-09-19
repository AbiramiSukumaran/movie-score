import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MovieService {
  URL = 'https://data.mongodb-api.com/app/data-xevmk/endpoint/data/v1/action/aggregate';

  constructor(private http: HttpClient) { }

  getSampleMovie() {

    const body = {
      dataSource: 'Cluster0',
      database: 'movies',
      collection: 'movies',
      pipeline: [
        {
          $sample: {
            size: 1
          }
        }
      ]
    };

    const headers: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      'Access-Control-Request-Headers': '*',
      'api-key': 'rX1p51Khf1l5zueBGbNNl3jZ4ElLrDb3hrWVOwgDrF1uYqDc9EGF6z7aFD8qrjjhk'
    });

    return this.http.post(this.URL, body, {
      headers
    });
  }
}



// curl --location --request POST 'https://data.mongodb-api.com/app/data-xevmk/endpoint/data/v1/action/aggregate' \
// --header 'Content-Type: application/json' \
// --header 'Access-Control-Request-Headers: *' \
// --header 'api-key: rX1p51Khf1l5zueBGbNNl3jZ4ElLrDb3hrWVOwgDrF1uYqDc9EGF6z7aFD8qrjjh' \
// --data-raw '{
//     "collection":"movies",
//     "database":"movies",
//     "dataSource":"Cluster0",
//     "pipeline": [
//       { "$sample": { "size": 1 } }
//     ]
// }'
