import { Component, Input, Output, EventEmitter, OnInit } from 'angular2/core';
import { SALTIE_LINK } from '../../services/rest/constants';
import { RestService } from '../../services/rest.service';

@Component({
    selector: 'email-cruises',
    styles: [
		require('./email-cruises.component.scss').toString()
    ],
    template: require('./email-cruises.component.html'),
    directives: []
})
export class EmailCruisesComponent {
	@Input() show: boolean;
	@Input() tripLink: string;
	@Input() tripDesc: string;
	@Output() hide: EventEmitter<void>;

	private state = 0;
	private email: string;

	constructor(private rest: RestService) {
		this.show = false;
		this.hide = new EventEmitter<void>();
		this.email = null;
	}

	emailFavorites() {
		this.state = 1;
		this.rest.favorites.save(
			this.email,
			(error) => {
				// Something bad happened
				console.log(error);
			}
		);
	}

	download() {
		window.location.href = SALTIE_LINK;	
	}

	back() {
		this.show = false;
		this.state = 0;
		this.hide.emit(null);
	}
}