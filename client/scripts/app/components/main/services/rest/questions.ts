import { Http, Response } from 'angular2/http';
import { Observable }     from 'rxjs/Observable';
import { Rest } from './rest.ts';
import { BASE_API_URL } from './constants.ts';
import 'rxjs/Rx';

export class Question {
	constructor(
		public category_id: number,
		public question_id: number,
		public image: string,
		public description: string,
		public goodFor: string,
		public suggestions: string,
		public self: string,
		public text: string
	) {}
}

export class Questions extends Rest {
	private questions: Question[];

	constructor(
		public http: Http
	) {
		super(http);
		this.questions = new Array<Question>();
	}

	getById(question_id: number, cb) {
		if (this.questions.length === 0) {
			return this.http.get(`${BASE_API_URL}/api/explore/questions/${question_id}`)
				.map(this.extractData)
				.catch(this.handleError)
				.subscribe(
					(_question) => {
						let question = new Question(
							_question.category_id,
							_question.question_id,
							_question.image_url,
							_question.description,
							_question.goodFor,
							_question.sugestions,
							_question.self,
							_question.text
						);
						cb(null, question);
					},
					(error) => {
						cb(error);
					}
				)
		} else {
			// Search through our array, this should be implemented
			// as a hash, however everything is an array at this point.
			// I do not expect large enough data for this to become a problem.
			// Will however change when optimizing.
			for (let i = 0; i < this.questions.length; i ++) {
				if (this.questions[i].question_id === question_id) {
					cb(null, this.questions[i]);
					break;
				}
			}
		}
	}

	get(category_id: number, cb) {
		if (this.questions.length === 0) {
			return this.http.get(`${BASE_API_URL}/api/explore/categories/${category_id}/questions`)
				.map(this.extractData)
				.catch(this.handleError)
				.subscribe(
					(questionsResults) => {
						// Skip if null
						if (questionsResults === null) {
							cb(null, null);
							return;
						}

						this.questions = [];

						questionsResults.results.forEach(
							(_question) => {
								this.questions.push(
									new Question(
										_question.category_id,
										_question.question_id,
										_question.image_url,
										_question.description,
										_question.goodFor,
										_question.sugestions,
										_question.self,
										_question.text
									)
								)
							}
						);

						cb(null, this.questions);
					},
					(error) => {
						if (error.status === 404) {
							cb(null, null);
							return;
						}

						cb(error);
					}
				);
		} else {
			cb(null, this.questions);
		}
	}
}