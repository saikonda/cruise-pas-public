import { Injectable, Inject } from 'angular2/core';
import { Http, Response } from 'angular2/http';
import { Observable }     from 'rxjs/Observable';

import { Categories } from "./rest/categories";
import { Questions } from "./rest/questions";
import { Recommendations } from "./rest/recommendations";
import { Survey } from "./rest/survey";
import { Regions, REGIONS } from "./rest/regions";
import { Traveling } from "./rest/traveling";
import { Favorites } from "./rest/favorites";


@Injectable()
export class RestService {
	public categories: Categories;
	public questions: Questions;
	public survey: Survey;
	public recommendations: Recommendations;
	public regions: Regions;
	public traveling: Traveling;
	public favorites: Favorites;

	constructor(
		private http: Http
	) {
		this.survey = new Survey();
		this.questions = new Questions(http);
		this.categories = new Categories(http, this.questions);
		this.recommendations = new Recommendations(http, this.survey);
		this.regions = new Regions();
		this.traveling = new Traveling(http);
		this.favorites = new Favorites(http, this.recommendations);
	}
}