import { Http, Response } from 'angular2/http';
import { Observable }     from 'rxjs/Observable';
import { Rest } from './rest.ts';
import { BASE_API_URL } from './constants';
import { Questions, Question } from './questions';
import 'rxjs/Rx';

let ls = require('local-storage');

export class Category {
	public questions: Array<Question>;
	public progress: number;
	public answered: Set<number>;

	constructor(
		public category_id: number,
		public title: string,
		public image: string
	) {
		this.progress = 0;
		this.progress = ls(`c_${category_id}`) ? ls(`c_${category_id}`) : 0;
		this.answered = new Set<number>();
		this.questions = new Array<Question>();
	}
}

export class Categories extends Rest {
	private categories: Category[];

	constructor(
		public http: Http,
		public questions: Questions
	) {
		super(http);
		this.categories = new Array<Category>();
	}

	fetchQuestionSummary(category: Category) {
		return new Promise<Question>(
			(resolve, reject) => {
				this.questions.get(
					category.category_id,
					(err, questionData) => {
						if (err) {
							reject(err);
							return;
						}

						resolve(questionData);
					}
				);
			}
		)
	}

	getById(category_id: number, cb: any) {
		let self = this;

		// Retrieve our category from our cache
		function getCachedCategory(category_id):any {
			for (let i = 0; i < self.categories.length; i++) {
				let category = self.categories[i];
				if (category.category_id === category_id) {
					cb(null, category);
					return;
				}
			}

			cb(new Error("Category not found"));
		}

		// Retrieve our categories if they are not cached
		if (this.categories.length === 0) {
			this.get((error, categories) => {
				if (error) {
					cb(error);
					return;
				}

				// Retrive from cache
				getCachedCategory(category_id);
			})
		} else {
			// Retrive from cache
			getCachedCategory(category_id);
		}
	}

	getNextId(category_id: number) {
		let self = this;

		for (let i = 0; i < self.categories.length - 1; i++) {
			let category = self.categories[i];
			if (category.category_id === category_id) {
				return self.categories[i + 1];
			}
		}

		return null;
	}

	get(cb) {
		if (this.categories.length === 0) {
			this.http.get(`${BASE_API_URL}/api/explore/categories`)
				.map(this.extractData)
				.catch(this.handleError)
				.subscribe(
					(categoriesResult) => {
						let category_promises = [];

						// For each category in our results, extract the information
						categoriesResult.results.forEach((_category) => {
							let category = new Category(
								_category.category_id,
								_category.title,
								_category.image
							);

							// Fetch our question data per category
							category_promises.push(
								this.fetchQuestionSummary(category)
							);

							// Add to our category
							this.categories.push(category);
						});

						Promise.all(category_promises).then(
							(questions) => {
								// For all questions add to our category
								questions.forEach((question, index) => {
									if (question === null) return;
									this.categories[index].questions = question;
									// console.log(question);
									// console.log("BREAK");
								});

								cb(null, this.categories);
							},
							(error) => {
								// Empty our categories if we have issues with questions
								this.categories.splice(0,this.categories.length);
								cb(error);
							}
						);
					},
					(error) => {
						cb(error);
					}
				);
		} else {
			cb(null, this.categories);
		}
	}
}