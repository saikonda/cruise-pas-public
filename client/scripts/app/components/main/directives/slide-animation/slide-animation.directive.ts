import { Directive, ElementRef, Input, OnInit } from 'angular2/core';
import { Observable } from 'rxjs/Observable';

@Directive({
	selector: '[slide-animation]',
	host: {}
})
export class SlideAnimation implements OnInit {
	@Input('type') type: string;
	@Input('direction') direction: string;
	@Input('trigger') trigger: Observable<string>;

	private initialClass: string;

    constructor(private el: ElementRef) {
		this.direction = null;
    }

    transition(direction) {
		this.el.nativeElement.className = this.initialClass;
		if (this.type === 'no-delay') {
			this.el.nativeElement.className += ` slide-${direction}`;
		} else {
			this.el.nativeElement.className += ` slide-${direction}-delay-200ms`;
		}
    }

    transitionOut(direction) {
		this.el.nativeElement.className = this.initialClass;
		if (this.type === 'no-delay') {
			this.el.nativeElement.className += ` slide-${direction}-out`;
		} else {
			this.el.nativeElement.className += ` slide-${direction}-out-delay-200ms`;
		}
    }

    ngOnInit() {
		let direction = this.direction ? this.direction : 'left';
		this.initialClass = this.el.nativeElement.className;
		this.transition(direction);
		this.trigger.subscribe(
			(_direction) => {
				this.transitionOut(_direction);
			}
		)
    }
}