import { Http, Response, Headers } from 'angular2/http';
import { Observable }     from 'rxjs/Observable';

export class Rest {
	constructor(
		public http: Http
	) {

	}

	public extractData(res: Response) {
		if (res.status < 200 || res.status >= 300) {
			throw new Error('Response status: ' + res.status);
		}
		let body = res.json();
		return body || {};
	}

	public handleError(error: any) {
		return Observable.throw(error);
	}
}