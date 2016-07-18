import { Http, Response } from 'angular2/http';
import { Observable }     from 'rxjs/Observable';
import { Rest } from './rest.ts';
import { BASE_API_URL } from './constants';
import { Questions, Question } from './questions'
import 'rxjs/Rx';

export class Email {
	constructor(
		public email: string,
		public favoriteTripIds: Array<string>
	) {}
}

export class ShareEmail extends Rest {
	private sharemail: Email[];

	constructor(
		public http: Http
	) {
		super(http);
		this.sharemail = new Array<Email>();
	}

	get(cb) {
		if (this.sharemail.length === 0) {
			this.http.get(`${BASE_API_URL}/api/explore/emailUser`)
				.map(this.extractData)
				.catch(this.handleError)
				.subscribe(
				(sharemail) => {
						this.sharemail = sharemail.results.map(_sharemail => new Email(
							_sharemail.email,
							_sharemail.favoriteTripIds
						));
						cb(null, this.sharemail);
					},
					(error) => {
						cb(error);
					}
				);
		} else {
			cb(null, this.sharemail);
		}
	}
}