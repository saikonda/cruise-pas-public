import { Component, ElementRef, Input, OnDestroy, OnInit } from 'angular2/core';
import { RestService } from '../../services/rest.service';
import { EmailCruisesComponent } from '../../modals/email-cruises/email-cruises.component';
import { Favorite } from '../../services/rest/favorites';
import { BASE_URL } from '../../services/rest/constants';
import { SALTIE_LINK } from '../../services/rest/constants';

@Component({
    selector: 'view-favorites',
    styles: [],
    template: require('./view-favorites.component.html'),
    directives: [EmailCruisesComponent]
})
export class ViewFavoritesComponent implements OnInit {
	private favorites: Array<Favorite>;
	private emailScreen: boolean;
	private baseUrl = BASE_URL;
	private shareTripLink: string;
	private shareTripDesc: string;

	constructor(private rest: RestService) {
		this.emailScreen = false;
		this.favorites = new Array<Favorite>();
	}

	ngOnInit() {
		this.rest.favorites.getSummaries((error, favorites) => {
			if (error) {
				console.log(error);
				return;
			}

			this.favorites = favorites;
		});
	}

	download() {
		window.location.href = SALTIE_LINK;	
	}
}