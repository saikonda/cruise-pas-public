import { Http, Response } from 'angular2/http';
import { Observable }     from 'rxjs/Observable';
import { Rest } from './rest.ts';
import { BASE_API_URL } from './constants';
import { Survey } from './survey';
import 'rxjs/Rx';

export class IteneraryDay {
	constructor (
		public day: string,
		public portName: string,
		public arrival: string,
		public departure: string,
		public portDesc: string,
		public id: number
	) {}
}

export class RecommendationDetail {
	constructor(
		public iteneraryImage: string,
		public startingFrom: string,
		public iteneraryDays: IteneraryDay[]
	) {}
}

export class Recommendation {
	public detail: RecommendationDetail;

	constructor(
		public tripId: string,
		public tripName: string,
		public tripDesc: string,
		public cruiseLineName: string,
		public priceFrom: string,
		public destinationImage: string,
		public matchPercent: string,
		public matchReason: string,
		public tripLink: string,
		public noNights: string,
		public shipName: string
	) {}
}

export class Recommendations extends Rest {
	private recommendations: Recommendation[];
	private start: number;
	private count: number;
	private questions_liked: string;
	private questions_disliked: string;
	private questions_neutral: string;
	private query: string;

	constructor(
		public http: Http,
		public survey: Survey
	) {
		super(http);
		this.recommendations = new Array<Recommendation>();
		this.count = -1;
		this.start = 0;
	}

	querySet(_set: Set<number>): string {
		// Create query for liked
		let _str = '';
		_set.forEach((liked) => {
			_str += liked + ',';
		});
		_str = _str.substring(0, _str.length - 1);

		return _str;
	}

	initializeRecommendations(cb) {
		this.questions_neutral = this.querySet(this.survey.neutral);
		this.questions_liked = this.querySet(this.survey.liked);
		this.questions_disliked = this.querySet(this.survey.disliked);
		this.query = `${BASE_API_URL}/api/explore/cruises?`;
		if (this.questions_liked !== '') {
			this.query += `questions_liked=${this.questions_liked}&`
		}

		if (this.questions_disliked !== '') {
			this.query += `questions_disliked=${this.questions_disliked}&`;
		}

		if (this.questions_neutral !== '') {
			this.query += `questions_neutral=${this.questions_neutral}&`;
		}

		this.count = -1;
		this.paginate(cb);
	}

	paginate(cb) {
		if (this.start > this.count && this.count > -1) {
			cb(null, this.recommendations);
		}
		// Now that we've built our query out we can start paginating
		this.http.get(`${this.query}start=${this.start}&size=10`)
			.map(this.extractData)
			.catch(this.handleError)
			.subscribe(
				(recommendationsResult) => {
					this.count = recommendationsResult.count;
					recommendationsResult.tripList.forEach((trip) => {
						this.recommendations.push(
							new Recommendation(
								trip.tripId,
								trip.tripName,
								trip.tripDesc,
								trip.cruiseLineName,
								trip.priceFrom,
								trip.destinationImage,
								trip.matchPercent,
								trip.matchReason,
								trip.tripLink,
								trip.noNights,
								trip.shipName
							)
						)
					});
					cb(null, this.recommendations);
				},
				(error) => {
					cb(error);
				}
			);
		this.start = this.start + 10;
	}

	get(cb) {
		if (this.survey.cached) {
			// We can continue paginating
			this.paginate(cb);
		} else {
			// We are not cached then we must reinitialize
			this.initializeRecommendations(cb);
		}
	}

	tripLink(tripId, cb) {
		this.http.get(`${BASE_API_URL}/api/explore/triplinks/${tripId}`)
			.map(this.extractData)
			.catch(this.handleError)
			.subscribe(
				(result) => {
					console.log(result);
					cb(null)
				},
				(err) => {
					cb(err);
				}
			)
	}

	getDetail(tripId, cb) {
		// Since recommendations is in an array... it should be
		// a hash, we need to go through the motions and search
		// our array.
		let recommendation = this.recommendations.find((recommendation) => {
			return recommendation.tripId === tripId;
		});

		// Now we must see if we have the detail already
		if (recommendation && recommendation.detail) {
			cb(null, recommendation);
		} else {
			// We must now retrieve our recommendation detail
			this.http.get(`${BASE_API_URL}/api/explore/cruises/${tripId}/detail`)
				.map(this.extractData)
				.catch(this.handleError)
				.subscribe(
					(_detailResults) => {
						let detailResults = _detailResults.tripDetails;
						let a = detailResults.startingFrom.toString();
						let dateString = a.slice(0, 4) + '-' + a.slice(4, 6) + '-' + a.slice(6, 8);
						if (!recommendation) {
							recommendation = new Recommendation(
								detailResults.tripId,
								detailResults.tripName,
								detailResults.tripDesc,
								detailResults.cruiseLineName,
								detailResults.priceFrom,
								detailResults.destinationImage,
								detailResults.matchPercent,
								detailResults.matchReason,
								detailResults.tripLink,
								detailResults.noNights,
								detailResults.shipName
							);
						}

						recommendation.detail = new RecommendationDetail(
							detailResults.itineraryImage,
							dateString,
							detailResults.itineraryDay.map((day) => {
								return new IteneraryDay(
									day.day,
									day.portName,
									day.arrival,
									day.departure,
									day.portDesc,
									day.id
								)
							})
						);

						// Boom that's all she wrote
						cb(null, recommendation);
					},
					(error) => {
						cb(error);
					}
				)
		}
	}
}