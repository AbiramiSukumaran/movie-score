import { Component } from '@angular/core';
import { Validators, FormArray, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-add-movie',
  templateUrl: './add-movie.component.html',
  styleUrls: [ './add-movie.component.scss' ]
})
export class AddMovieComponent {
  movieForm = this.fb.group({
    name: ['', Validators.required],
    rating: ['', Validators.required],
    genre: ['', Validators.required],
    year: [2000, [Validators.required, Validators.min(1900), Validators.max(2050)]],
    released: [new Date(), [Validators.required]],
    director: ['', Validators.required],
    writer: ['', Validators.required],
    star: ['', Validators.required],
    country: ['', Validators.required],
    budget: [0, [Validators.required, Validators.min(0)]],
    company: ['', Validators.required],
    runtime: [90, [Validators.required, Validators.min(0)]]
  });

  constructor(private fb: FormBuilder) { }

  updateMovie() {
    this.movieForm.patchValue({
      name: 'The Kid Who Would Be King',
      rating: 'PG',
      genre: 'action',
      year: 2019,
      released: new Date('1/25/2019'),
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
    const movieDetails = this.movieForm.value;
    const title = movieDetails.name;

    console.log(movieDetails, title);
  }
}
