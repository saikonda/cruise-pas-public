import { Category } from './categories';
import { Question } from './questions';

let ls = require('local-storage');

export enum SURVEY {
	none = -1,
	disliked,
	neutral,
	liked
}

export class Survey {
	// We want liked to be encapsulated
	private _liked: Set<number>;
	private _disliked: Set<number>;
	private _neutral: Set<number>;
	private _cached: boolean;

	constructor() {
		if (ls('_liked')) {
			this._liked = new Set<number>(ls('_liked'));
			this._disliked = new Set<number>(ls('_disliked'));
			this._neutral = new Set<number>(ls('_neutral'));
			this._cached = ls('_cached');
		} else {
			this._liked = new Set<number>();
			this._disliked = new Set<number>();
			this._neutral = new Set<number>();
			this._cached = true;
		}
	}

	// Our returned value needs to be immutable
	public get liked(): Set<number> {
		return new Set<number>(this._liked.keys());
	}

	// Our returned value needs to be immutable
	public get disliked(): Set<number> {
		return new Set<number>(this._disliked.keys());
	}

	public get neutral(): Set<number> {
		return new Set<number>(this._neutral.keys());
	}

	// Our returned value needs to be immutable
	public get cached(): boolean {
		return this._cached;
	}

	public set cached(value: boolean) {
		this._cached = value;
	}

	store() {
		let liked = [], neutral = [], disliked = [];
		this._liked.forEach((_) => {
			liked.push(_);
		});
		this._neutral.forEach((_) => {
			neutral.push(_);
		});
		this._disliked.forEach((_) => {
			disliked.push(_);
		});
		ls('_liked', liked);
		ls('_neutral', neutral);
		ls('_disliked', disliked);
		ls('_cached', false);
	}

	like(category: Category, question: Question) {
		this._cached = false;
		category.answered.add(question.question_id);
		this._liked.add(question.question_id);
		this._disliked.delete(question.question_id);
		this._neutral.delete(question.question_id);
		this.store();
		category.progress = 100 * (category.answered.size / category.questions.length);
	}

	like_q(question: Question) {
		this._cached = false;
		this._liked.add(question.question_id);
		this._disliked.delete(question.question_id);
		this._neutral.delete(question.question_id);
		this.store();
	}

	toggle_like(question_id: number) {
		if (this._liked.has(question_id)) {
			this._liked.delete(question_id);
		} else {
			this._liked.add(question_id);
		}
		this.store();
	}

	dislike(category: Category, question: Question) {
		this._cached = false;
		category.answered.add(question.question_id);
		this._liked.delete(question.question_id);
		this._disliked.add(question.question_id);
		this._neutral.delete(question.question_id);
		this.store();
		category.progress = 100 * (category.answered.size / category.questions.length);
	}

	maybe(category: Category, question: Question) {
		this._cached = false;
		category.answered.add(question.question_id);
		this._liked.delete(question.question_id);
		this._disliked.delete(question.question_id);
		this._neutral.add(question.question_id);
		this.store();
		category.progress = 100 * (category.answered.size / category.questions.length);
	}

	answer(question_id: number) {
		if (this._liked.has(question_id))
			return 2;
		if (this._disliked.has(question_id))
			return 0;
		if (this._neutral.has(question_id))
			return 1;
		return -1;
	}
}