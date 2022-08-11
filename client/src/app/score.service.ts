import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ScoreService {
  private static URL = 'https://us-central1-abis-345004.cloudfunctions.net/prediction_result_update';

  constructor(private http: HttpClient) { }

  getScore(title: string, details: any) {
    details = `[${JSON.stringify(details)}]`;

    return this.http.get(ScoreService.URL, {
      params: {
        title,
        movieDetail: details
      }
    });
  }
}
