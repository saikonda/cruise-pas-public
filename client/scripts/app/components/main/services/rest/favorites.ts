import { Http, Response, Headers } from 'angular2/http';
import { Observable }     from 'rxjs/Observable';
import { Recommendations, Recommendation } from './recommendations.ts';
import { Rest } from './rest.ts';
import { BASE_API_URL } from './constants.ts';
import 'rxjs/Rx';

let ls = require('local-storage');

export class Favorite {
	constructor ( 
		private tripId: string,
		private tripName: string,
		private tripDesc: string,
		private cruiseLineName: string,
		private noNights: string,
		private priceFrom: string,
		private shipName: string,
		private destinationImage: string,
		private matchPercent: string,
		private matchReason: string,
		private tripLink: string
	) {}
}

export class Favorites extends Rest {
	private favorites: Set<string>;
	private email: string;
	private summaries: Array<Favorite>;
	private cacheClean: boolean;
	private userToken: string;

	constructor(public http: Http, private recommendations: Recommendations) {
		super(http);
		this.favorites = ls('favorites') ? new Set<string>(ls('favorites')) : new Set<string>();
		this.email = ls('email') ? ls('email') : null;
		this.userToken = ls('userToken') ? ls('userToken') : null;
		this.summaries = new Array<Favorite>();
		this.cacheClean = false;
	}

	get size() {
		return this.favorites.size;
	}

	get() {
		return this.favorites;
	}

	getSummaries(cb) {
		if (!this.cacheClean) {

			// We must create a promise array
			let promiseArray = [];
			this.favorites.forEach((_) => {
				promiseArray.push(
					new Promise((resolve, reject) => {
						this.recommendations.getDetail(_, (err, recommendation) => {
							if (err) {
								reject(err);
								return;
							}
							resolve(
								new Favorite(
									recommendation.tripId,
									recommendation.tripName,
									recommendation.tripDesc,
									recommendation.cruiseLineName,
									recommendation.noNights,
									recommendation.priceFrom,
									recommendation.shipName,
									recommendation.destinationImage,
									recommendation.matchPercent,
									recommendation.matchReason,
									recommendation.tripLink
								)
							);
						})
					})
				)
			});

			Promise.all(promiseArray).then(
				(favorites: Array<Favorite>) => {
					this.summaries = favorites;
					cb(null, this.summaries);
					this.cacheClean = true;
				},
				(err) => {
					this.cacheClean = false;
					cb(err);
				}
			);
		} else {
			cb(null, this.summaries);
		}
	}

	has(favorite) {
		return this.favorites.has(favorite);
	}

	cache() {
		let _favorites = [];
		this.favorites.forEach((_) => {
			_favorites.push(_);
		})

		ls('favorites', _favorites);
	}

	add(favorite) {
		this.favorites.add(favorite);
		this.cacheClean = false;
		this.cache();
	}

	delete(favorite) {
		this.favorites.delete(favorite);
		this.cacheClean = false;
		this.cache();
	}

	emailFavorites(email, cb) {
		if (!email) {
			cb(new Error("Must provide email"));
			return;
		}

		let _favorites = [];
		this.favorites.forEach(_ => _favorites.push(_));

		this.http.post(
			`${BASE_API_URL}/api/explore/emailUser`,
			JSON.stringify({
				userToken: email,
				favoriteTripIds: _favorites
			}),
			{ headers: new Headers(
				{ 'Content-Type': 'application/json',

					'X-Auth-Token': email
				}

			) }
		).map(this.extractData)
			.catch(this.handleError)
			.subscribe(
			(token) => {
				console.log(token);
				// ls('favorites', _favorites);
				// ls('email', email);
				// this.email = email;
				// cb(null, token);
			},
			(error) => {
				cb(error);
			}
		)
	}

	save(email, cb) {
		if (!email) {
			cb(new Error("Must provide email"));
			return;
		}

		let _favorites = [];
		this.favorites.forEach(_ => _favorites.push(_));

		this.http.post(
			`${BASE_API_URL}/api/explore/emailUser`,
			JSON.stringify({
				email: email,
				favoriteTripIds: _favorites
			}),
			{ headers: new Headers({ 'Content-Type': 'application/json' }) }
		).map(this.extractData)
		.catch(this.handleError)
		.subscribe(
			(token) => {
				ls('favorites', _favorites);
				ls('email', email);
				ls('userToken', token.userToken);
				this.email = email;
				this.userToken = token.userToken;
				cb(null);
			},
			(error) => {
				cb(error);
			}
		)
	}
}