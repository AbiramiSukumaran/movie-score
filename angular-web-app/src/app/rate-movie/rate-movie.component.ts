import { Component, OnInit } from '@angular/core';
import { Validators, FormBuilder } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter, map, switchMap } from 'rxjs/operators';
import { ScoreService } from '../score.service';
import { MovieService } from '../movie.service';
import { Observable } from 'rxjs';
import { Movie } from '../movie';


@Component({
  selector: 'rate-movie',
  templateUrl: './rate-movie.component.html',
  styleUrls: ['./rate-movie.component.scss']
})
export class RateMovieComponent implements OnInit {
  ratings = [
    'Approved', 'G',
    'NC-17', 'Not Rated',
    'PG', 'PG-13',
    'R', 'TV-14',
    'TV-MA', 'TV-PG',
    'Unrated', 'X'
  ];

  genres = [
    'Action', 'Adventure',
    'Animation', 'Biography',
    'Comedy', 'Crime',
    'Drama', 'Family',
    'Fantasy', 'History',
    'Horror', 'Music',
    'Musical', 'Mystery',
    'Romance', 'Sci-Fi',
    'Sport', 'Thriller',
    'Western'
  ];

  score: number | null = null;
  scoreRequestPending = false;
  randomMovieRequestPending = false;
  titleOptions: Observable<Movie[]>;
  directorOptions: Observable<string[]>;
  writerOptions: Observable<string[]>;
  starOptions: Observable<string[]>;

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
    private scoreService: ScoreService,
    private movieService: MovieService
  ) {
  }

  ngOnInit() {
    this.titleOptions = this.movieForm.controls.name.valueChanges.pipe(
      filter(text => text!.length > 1),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchTerm => this.movieService.searchMovieByTitle(searchTerm!)),
    );

    this.directorOptions = this.movieForm.controls.director.valueChanges.pipe(
      filter(text => text!.length > 2),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchTerm => this.movieService.searchMovieDirector(searchTerm!)),
    );

    this.writerOptions = this.movieForm.controls.writer.valueChanges.pipe(
      filter(text => text!.length > 2),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchTerm => this.movieService.searchMovieWriter(searchTerm!)),
    );

    this.starOptions = this.movieForm.controls.star.valueChanges.pipe(
      filter(text => text!.length > 2),
      debounceTime(250),
      distinctUntilChanged(),
      switchMap(searchTerm => this.movieService.searchMovieStar(searchTerm!)),
    );

  }

  titleSelected(event: any) {
    this.movieForm.patchValue({
      ...event.option.value,
      releasedDate: new Date(event.option.value.released)
    }, { emitEvent: false });
  }

  loadRandomMovie() {
    this.randomMovieRequestPending = true;
    this.movieService.getRandomMovie()
      .subscribe(res => {
        this.movieForm.patchValue({
          ...res,
          releasedDate: new Date(res.released)
        }, { emitEvent: false });
        this.randomMovieRequestPending = false;
        this.score = null;
      });
  }

  onSubmit() {
    this.scoreRequestPending = true;
    const movieDetails = this.movieForm.value;
    const title = movieDetails.name || '';
    (<any>movieDetails).released = this.dateToString(movieDetails.releasedDate || new Date());
    delete movieDetails.releasedDate;

    this.scoreService.getScore(title, movieDetails)
      .subscribe((score: any) => {
        this.score = score;
        this.scoreRequestPending = false;
      });
  }

  private dateToString(date: Date) {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  }
}
