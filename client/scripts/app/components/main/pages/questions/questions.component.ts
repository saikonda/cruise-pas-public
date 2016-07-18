import { Component, ElementRef, OnInit, AfterViewInit, Output, EventEmitter } from 'angular2/core';
import { Router, RouteParams, Location } from 'angular2/router';
import { SlideAnimation } from '../../directives/slide-animation/slide-animation.directive';
import { RestService } from '../../services/rest.service';
import { Category } from '../../services/rest/categories';
import { Question } from '../../services/rest/questions';
import { Survey } from '../../services/rest/survey';
import { BASE_URL } from '../../services/rest/constants';

let $ = require('jquery');

let ls = require('local-storage');

@Component({
    selector: 'questions',
    styles: [],
    template: require('./questions.component.html'),
    directives: [SlideAnimation]
})
export class QuestionsComponent implements OnInit {
	private category: Category;
	private nextCategory: Category;
	private question: Question;
	private survey: Survey;
	private index: number;
	private element: any;
	private BASE_URL: string;
	private answer: number;
	private transitionDirection: string;
	constructor(
		private router: Router,
		private location: Location,
		private navp: RouteParams,
		private elementRef: ElementRef,
		private rest: RestService
	) {
		this.element = $(this.elementRef.nativeElement);
		this.index = parseInt(navp.get('index'));
		this.BASE_URL = BASE_URL;
		this.answer = -1;
	}

	ngOnInit() {
		let category_id = parseInt(this.navp.get('category_id'));
		this.transitionDirection = this.navp.get('transitionDirection');
		this.survey = this.rest.survey;
		this.rest.categories.getById(category_id, (error, category) => {
			this.category = category;
			if (this.index === this.category.questions.length) {
				let nextCategory = this.rest.categories.getNextId(category_id);
				this.nextCategory = nextCategory.questions ? nextCategory : null;
				return;
			};
			this.question = this.category.questions[this.index];
			this.answer = this.survey.answer(this.question.question_id);
		});
	}

	private transitionOut: EventEmitter<string> = new EventEmitter();

	goToNextCategory() {
		this.router.navigate(['Questions', {category_id: this.nextCategory.category_id, index: 0}]);
	}

	goToAllCategories() {
		this.router.navigate(['Categories']);
	}

	recommendations() {
		this.router.navigate(['Recommendations']);
	}

	back() {
		if (this.index - 1 >= 0) {
			this.transitionOut.emit('right');
			setTimeout(
				() => {
					this.router.navigate(['Questions', { category_id: this.category.category_id, index: this.index - 1, transitionDirection: 'right' }]);
				},
				1000
			);
		} else {
			this.location.back();
		}
	}

	next() {
		this.transitionOut.emit('left');
		setTimeout(
			() => {
				this.router.navigate(['Questions', { category_id: this.category.category_id, index: this.index + 1, transitionDirection: 'left' }]);
			},
			1000
		);
	}

	choose(index: number) {
		this.answer = index;

		switch (index) {
			case 0:
				this.survey.dislike(this.category, this.question);
				ls(`c_${this.category.category_id}`, this.category.progress);
				break;
			case 1:
				this.survey.maybe(this.category, this.question);
				ls(`c_${this.category.category_id}`, this.category.progress);
				break;
			case 2:
				this.survey.like(this.category, this.question);
				ls(`c_${this.category.category_id}`, this.category.progress);
				break;
		}

		this.next();
	}	
}