import { Component } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
// import { MovieService } from '../movie.service';
import { ScoreService } from '../score.service';

@Component({
  selector: 'app-add-movie',
  templateUrl: './add-movie.component.html',
  styleUrls: ['./add-movie.component.scss']
})
export class AddMovieComponent {
  score: number | null = null;
  requestPending = false;

  movieForm = this.fb.group({
    name: ['', Validators.required],
    rating: ['', Validators.required],
    genre: ['', Validators.required],
    year: [2000, [Validators.required, Validators.min(1900), Validators.max(2050)]],
    releasedDate: [new Date(), [Validators.required]],
    director: ['', Validators.required],
    writer: ['', Validators.required],
    star: ['', Validators.required],
    country: ['', Validators.required],
    budget: [1000000, [Validators.required, Validators.min(0)]],
    company: ['', Validators.required],
    runtime: [90, [Validators.required, Validators.min(0)]]
  });

  constructor(
    private fb: FormBuilder,
    // private movieService: MovieService,
    private scoreService: ScoreService
  ) {
  }

  updateMovie() {
    // this.movieService.getSampleMovie()
    //   .subscribe(res => console.dir(res));

    this.movieForm.patchValue({
      name: 'The Kid Who Would Be King',
      rating: 'PG',
      genre: 'action',
      year: 2019,
      releasedDate: new Date(),
      director: 'Joe Cornish',
      writer: 'Joe Cornish',
      star: 'Louis Ashbourne Serkis',
      country: 'United Kingdom',
      budget: 59000000,
      company: 'Big Talk Productions',
      runtime: 120
    });
  }

  onSubmit() {
    this.requestPending = true;
    const movieDetails = this.movieForm.value;
    const title = movieDetails.name || '';
    (<any>movieDetails).released = this.dateToString(movieDetails.releasedDate || new Date());

    this.scoreService.getScore(title, movieDetails)
      .subscribe((score: any) => {
        this.score = score;
        this.requestPending = false;
      });
  }

  private dateToString(date: Date) {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }
}
