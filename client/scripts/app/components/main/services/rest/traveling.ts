import { Http, Response } from 'angular2/http';
import { Observable }     from 'rxjs/Observable';
import { Rest } from './rest.ts';
import { BASE_API_URL } from './constants';
import { Questions, Question } from './questions';
import 'rxjs/Rx';

export class Travel {
	constructor(
		public category_id: number,
		public question_id: number,
		public image_url: string,
		public description: string,
		public goodFor: string,
		public suggestions: string,
		public self: string,
		public text: string
	) {}
}

export class Traveling extends Rest {
	private traveling: Travel[];

	constructor(
		public http: Http
	) {
		super(http);
		this.traveling = new Array<Travel>();
	}

	get(cb) {
		if (this.traveling.length === 0) {
			this.http.get(`${BASE_API_URL}/api/explore/partyTypes`)
				.map(this.extractData)
				.catch(this.handleError)
				.subscribe(
				(traveling) => {
						this.traveling = traveling.results.map(_travel => new Travel(
							_travel.category_id,
							_travel.question_id,
							_travel.image_url,
							_travel.description,
							_travel.goodFor,
							_travel.suggestions,
							_travel.self,
							_travel.text
						));
						cb(null, this.traveling);
					},
					(error) => {
						cb(error);
					}
				);
		} else {
			cb(null, this.traveling);
		}
	}
}