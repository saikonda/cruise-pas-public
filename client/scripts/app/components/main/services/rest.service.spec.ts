import {
	beforeEach,
	beforeEachProviders,
	describe,
	expect,
	it,
	inject,
	injectAsync
} from 'angular2/testing';

import {Http, HTTP_PROVIDERS, XHRBackend, Response, ResponseOptions} from 'angular2/http';
import {provide} from 'angular2/core';
import {MockBackend} from 'angular2/http/testing';
import {RestService} from './rest.service';
import {BASE_API_URL} from './rest/constants';
import {Travel} from './rest/traveling';
import {Question} from './rest/questions';
import {Category} from './rest/categories';
import {Survey} from './rest/survey';
import {Recommendation} from './rest/recommendations';

let faker = require('faker');

let ls = require('local-storage');

let send200 = (body, c) => {
	let response = new Response(
		new ResponseOptions(
			{
				status: 200,
				body: body
			}
		)
	);

	c.mockRespond(response);
}

let beforeHack = (before, cb) => {
	return inject([RestService, XHRBackend], (rest: RestService, mockBackend: MockBackend) => {
		before(rest, mockBackend, cb);
	});
}

describe('RestService', () => {

	beforeEachProviders(() => [
		HTTP_PROVIDERS,
		provide(XHRBackend, { useClass: MockBackend }),
		RestService
	]);

	describe('Travel', () => {
		it('get()', inject([RestService, XHRBackend], (rest: RestService, mockBackend: MockBackend) => {
			mockBackend.connections.subscribe(c => {
				if (c.request.url === `${BASE_API_URL}/api/explore/partyTypes` && c.request.method === 0) {
					let res = new Response(
						new ResponseOptions(
							{
								body: {
									"results": [{
										"category_id": "123",
										"question_id": "123",
										"image_url": "http://test",
										"description": "I am a banana",
										"goodFor": "Me",
										"suggestions": "Good for you",
										"self": "http://another-link",
										"text": "This is all me"
									}]
								},
								status: 200
							}
						)
					);
					c.mockRespond(res);
				}
			})

			rest.traveling.get((err, response: Array<Travel>) => {
				expect(response.length).toBe(1);
				expect(response[0].category_id).toBeDefined();
				expect(response[0].category_id).toBe("123");
			});
		}));
	});

	describe('Questions', () => {
		var rest: RestService;
		var mockBackend: MockBackend;

		let before = (_rest, _mockBackend, cb) => {
			rest = _rest;
			mockBackend = _mockBackend;

			mockBackend.connections.subscribe(c => {
				let testPayload = {
					"category_id": "123",
					"question_id": "234",
					"image_url": "test234",
					"description": "this is a test",
					"goodFor": "everyone",
					"suggestions": "awesome stuff",
					"self": "http://test",
					"text": "this is some text"
				};

				if (c.request.url === `${BASE_API_URL}/api/explore/categories/123/questions` && c.request.method === 0) {
					send200({
						"results": [
							testPayload
						]
					}, c);
					return;
				}

				testPayload.question_id = "345";

				if (c.request.url === `${BASE_API_URL}/api/explore/questions/345` && c.request.method === 0) {
					send200({
						"results": [
							testPayload
						]
					}, c);
					return;
				}
			});

			cb();
		}

		it('get()', beforeHack(before, () => {
			rest.questions.get(123, (err, questions: Array<Question>) => {
				expect(questions.length).toBe(1);
				expect(questions[0].question_id).toBe("234");
			});
		}));

		it('getById()', beforeHack(before, () => {
			rest.questions.get(345, (err, question: Question) => {
				expect(question.question_id).toBe("345");
			});
		}));
	});

	describe('Categories', () => {
		var rest: RestService;
		var mockBackend: MockBackend;

		let before = (_rest, _mockBackend, cb) => {
			rest = _rest;
			mockBackend = _mockBackend;

			mockBackend.connections.subscribe(c => {
				let questionPayload1 = {
					"category_id": "234",
					"question_id": "345",
					"image_url": "test234",
					"description": "this is a test",
					"goodFor": "everyone",
					"suggestions": "awesome stuff",
					"self": "http://test",
					"text": "this is some text"
				};

				let questionPayload0 = {
					"category_id": "123",
					"question_id": "234",
					"image_url": "test234",
					"description": "this is a test",
					"goodFor": "everyone",
					"suggestions": "awesome stuff",
					"self": "http://test",
					"text": "this is some text"
				};

				let categoryPayload0 = {
					"category_id": "123",
					"title": "test_category",
					"image": "http://test.img"
				};

				let categoryPayload1 = {
					"category_id": "234",
					"title": "test_category",
					"image": "http://test.img"
				};

				if (c.request.url === `${BASE_API_URL}/api/explore/categories/123/questions` && c.request.method === 0) {
					send200({
						"results": [
							questionPayload0
						]
					}, c);
					return;
				}

				if (c.request.url === `${BASE_API_URL}/api/explore/categories/234/questions` && c.request.method === 0) {
					send200({
						"results": [
							questionPayload1
						]
					}, c);
					return;
				}

				if (c.request.url === `${BASE_API_URL}/api/explore/categories` && c.request.method === 0) {
					send200({
						"results": [
							categoryPayload0,
							categoryPayload1
						]
					}, c);
					return;
				}
			});

			cb();
		}

		it('get()', beforeHack(before, () => {
			rest.categories.get((err, categories: Array<Category>) => {
				expect(categories.length).toBe(2);
				expect(categories[0].title).toBe("test_category");
				expect(categories[0].questions.length).toBe(1);
				expect(categories[0].questions[0].description).toBe("this is a test");
			});
		}));

		it('getNextId()', beforeHack(before, () => {
			rest.categories.get((err, categories: Array<Category>) => {
				expect(categories.length).toBe(2);
				expect(categories[0].title).toBe("test_category");
				expect(categories[0].questions.length).toBe(1);
				expect(categories[0].questions[0].description).toBe("this is a test");

				// get category_id
				let category = rest.categories.getNextId(123);
				expect(category.category_id).toBe(234);
				expect(category.questions.length).toBe(1);
				expect(category.questions[0].question_id).toBe(345);
			});
		}));

		it('getById() -- cached', beforeHack(before, () => {
			rest.categories.get(() => {
				rest.categories.getById(123, (err, category) => {
					expect(category.length).toBe(1);
					expect(category.title).toBe("test_category");
					expect(category.questions.length).toBe(1);
					expect(category.questions[0].description).toBe("this is a test");
				});
			});
		}));

		it('getById() -- not cached', beforeHack(before, () => {
			rest.categories.getById(123, (err, category) => {
				expect(category.length).toBe(1);
				expect(category.title).toBe("test_category");
				expect(category.questions.length).toBe(1);
				expect(category.questions[0].description).toBe("this is a test");
			});
		}));

		// Not needed, tested through use of the other methods
		it('fetchQuestionSummary()', beforeHack(before, () => {

		}));
	});

	describe("Survey", () => {
		let category: Category = null;
		let survey: Survey = null;
		let question: Question = null;

		beforeEach(() => {
			ls.clear();
			question = new Question(
				123,
				123,
				"http://test.img",
				"test desc",
				"everyone",
				"test sugess",
				"self test",
				"text test"
			);
			survey = new Survey();
			category = new Category(123, "test", "http://test.img");
			category.questions = [question];
		});

		it('store()', () => {
			// Tested by other methods, no tests necessary
		});

		it('like(category: Category, question: Question)', () => {
			survey.dislike(category, question);
			expect(ls('_disliked').length).toBe(1);
			expect(ls('_disliked')[0]).toBe(123);
			expect(survey.disliked.size).toBe(1);
			expect(survey.disliked.has(123)).toBeTruthy();

			survey.like(category, question);
			expect(ls('_liked').length).toBe(1);
			expect(ls('_liked')[0]).toBe(123);
			expect(survey.liked.size).toBe(1);
			expect(survey.liked.has(123)).toBeTruthy();

			expect(ls('_disliked').length).toBe(0);
			expect(survey.disliked.size).toBe(0);

			expect(category.progress).toBe(100);
		});

		it('likq_q(question: Question)', () => {
			survey.dislike(category, question);
			expect(ls('_disliked').length).toBe(1);
			expect(ls('_disliked')[0]).toBe(123);
			expect(survey.disliked.size).toBe(1);
			expect(survey.disliked.has(123)).toBeTruthy();

			survey.like_q(question);
			expect(ls('_liked').length).toBe(1);
			expect(ls('_liked')[0]).toBe(123);
			expect(survey.liked.size).toBe(1);
			expect(survey.liked.has(123)).toBeTruthy();

			expect(ls('_disliked').length).toBe(0);
			expect(survey.disliked.size).toBe(0);
		});

		it('toggle_like(question_id: number)', () => {
			survey.like(category, question);
			expect(ls('_liked').length).toBe(1);
			expect(ls('_liked')[0]).toBe(123);
			expect(survey.liked.size).toBe(1);
			expect(survey.liked.has(123)).toBeTruthy();

			survey.toggle_like(question.question_id);
			expect(ls('_liked').length).toBe(0);
			expect(survey.liked.size).toBe(0);
		});

		it('dislike(category: Category, question: Question)', () => {
			survey.like(category, question);
			expect(ls('_liked').length).toBe(1);
			expect(ls('_liked')[0]).toBe(123);
			expect(survey.liked.size).toBe(1);
			expect(survey.liked.has(123)).toBeTruthy();

			survey.dislike(category, question);
			expect(ls('_disliked').length).toBe(1);
			expect(ls('_disliked')[0]).toBe(123);
			expect(survey.disliked.size).toBe(1);
			expect(survey.disliked.has(123)).toBeTruthy();

			expect(ls('_liked').length).toBe(0);
			expect(survey.liked.size).toBe(0);

			expect(category.progress).toBe(100);
		});

		it('maybe(category: Category, question: Question)', () => {
			survey.like(category, question);
			expect(ls('_liked').length).toBe(1);
			expect(ls('_liked')[0]).toBe(123);
			expect(survey.liked.size).toBe(1);
			expect(survey.liked.has(123)).toBeTruthy();

			survey.maybe(category, question);
			expect(ls('_neutral').length).toBe(1);
			expect(ls('_neutral')[0]).toBe(123);
			expect(survey.neutral.size).toBe(1);
			expect(survey.neutral.has(123)).toBeTruthy();

			expect(ls('_liked').length).toBe(0);
			expect(survey.liked.size).toBe(0);

			expect(category.progress).toBe(100);
		});

		it('answer(question_id: number)', () => {
			expect(survey.answer(question.question_id)).toBe(-1);
			survey.like(category, question);
			expect(survey.answer(question.question_id)).toBe(2);
			survey.dislike(category, question);
			expect(survey.answer(question.question_id)).toBe(0);
			survey.maybe(category, question);
			expect(survey.answer(question.question_id)).toBe(1);
		});
	});

	describe('Recommendations', () => {
		var rest: RestService;
		var mockBackend: MockBackend;
		var recommendation_fixtures: Array<Recommendation>;
		var category: Category;
		var questions: Array<Question>;

		beforeEach(() => {
			console.log('is this working? 0');
			recommendation_fixtures = new Array<Recommendation>();
			// Fill this with random shit
			for (let i = 0; i < recommendation_fixtures.length; i++) {
				recommendation_fixtures[i] = new Recommendation(
					faker.Lorem.words(),
					faker.Lorem.words(),
					faker.Lorem.words(),
					faker.Lorem.words(),
					faker.Lorem.words(),
					faker.Lorem.words(),
					faker.Lorem.words(),
					faker.Lorem.words(),
					faker.Lorem.words(),
					faker.Lorem.words(),
					faker.Lorem.words()
				)
			}
		});

		let before = (_rest, _mockBackend, cb) => {
			rest = _rest;
			mockBackend = _mockBackend;
			category = new Category(123, "test", "http://test.img");
			questions = new Array<Question>();
			for (let i = 0; i < 3; i ++) {
				questions.push(
					new Question(
						123,
						i,
						"faker.Lorem.words()",
						"faker.Lorem.words()",
						"faker.Lorem.words()",
						"faker.Lorem.words()",
						"faker.Lorem.words()",
						"faker.Lorem.words()"
					)
				);
			}

			ls.clear();
			
			rest.survey.like(category, questions[0]);
			rest.survey.dislike(category, questions[1]);
			rest.survey.maybe(category, questions[2]);

			mockBackend.connections.subscribe(c => {
				let match = c.request.url.match(/size=(\d+)/);
				console.log(match);
				if (match === null) throw new Error('Did not find parameter: size');
				let size = match[1];
				console.log('-----');
				match = c.request.url.match(/start=(\d+)/);
				console.log(match);
				if (match === null) throw new Error('Did not find parameter: start');
				let start = match[1];
				console.log('-----');

				console.log(`${BASE_API_URL}/api/explore/cruises?questions_liked=0&questions_disliked=1&questions_neutral=2&start=${start}&size=${size}`);
				console.log(c.request.url);
				// Handle all of our requests
				if (c.request.url === `${BASE_API_URL}/api/explore/cruises?questions_liked=123&questions_disliked=234&questions_neutral=345&start=${start}&size=${size}` && c.request.method === 0) {
					send200({
						"results": recommendation_fixtures.slice(start, size)
					}, c);
					return;
				}
			});
			cb();
		};

		it('querySet()', beforeHack(before, () => {
			// This gets tested through our other methods
		}));

		it('initializeRecommendations()', beforeHack(before, () => {
			console.log('is this working? 3');
			// We expect to get only the first 10 paginated recommendations
			rest.recommendations.initializeRecommendations((err, recommendations: Array<Recommendation>) => {
				console.log('//////');
				console.log(recommendations.length);
				console.log('//////');
				expect(recommendations.length).toBe(11);
				
			});
		}));

		it('paginate()', beforeHack(before, () => {

		}));

		it('get()', beforeHack(before, () => {

		}));

		it('getDetail()', beforeHack(before, () => {

		}));
	});

	describe('Favorites', () => {
		var rest: RestService;
		var mockBackend: MockBackend;

		let before = (_rest, _mockBackend, cb) => {
			rest = _rest;
			mockBackend = _mockBackend;
			mockBackend.connections.subscribe(c => {

			});
		};

		it('get()', beforeHack(before, () => {

		}));

		it('getSummaries()', beforeHack(before, () => {

		}));

		it('has()', beforeHack(before, () => {

		}));

		it('cache()', beforeHack(before, () => {

		}));

		it('add()', beforeHack(before, () => {

		}));

		it('delete()', beforeHack(before, () => {

		}));

		it('emailFavorites()', beforeHack(before, () => {

		}));

		it('save()', beforeHack(before, () => {

		}));
	});
});