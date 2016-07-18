import { Component, ElementRef, Input, OnDestroy, OnInit, OnChanges } from 'angular2/core';

import { ListHeader } from '../../../../lib/ListHeader';
import { ListItem } from '../../../../lib/ListItem';

import { MLButtonComponent } from '../../../ui_kit/mlbutton.component';
import { SaltieListComponent } from '../../../ui_kit/saltie-list.component';
import { SaltieHeaderComponent } from '../../../ui_kit/saltie-header.component';
import { SaltieCheckboxComponent } from '../../../ui_kit/saltie-checkbox.component';

import { EmailCruisesComponent } from '../../modals/email-cruises/email-cruises.component';

import { RestService } from '../../services/rest.service';
import { BASE_URL } from '../../services/rest/constants';
import { Recommendation } from '../../services/rest/recommendations';

import { Trip } from '../../../../lib/Trip';
import { TripDay } from '../../../../lib/TripDay';

var buildRecommendationDetail = require('./recommendation-detail.ts').buildRecommendationDetail;
var buildDetail = require('./recommendation-detail.ts').buildDetail;

import { Router } from 'angular2/router';

let ls = require('local-storage');

var $ = require('jquery');

function buildRecommendationItem(recommendation: Recommendation, rest: RestService, cb) {
	let expand = false;
	let favorite = rest.favorites.has(recommendation.tripId);
	let item = $(buildRecommendationDetail(
		recommendation
	));

	let arrow = item.find('img.saltie-rec-downarrow');
	let star = item.find('div.saltie-rec-star');
	let detail = item.find('div.saltie-rec-detail-container');
	let detailItenerary = null;

	if (favorite) {
		star.addClass('saltie-rec-favorite');
		star.find('img').attr("src", require('../../../../theme/imgs/saltie-starfish-white.svg'));
	} else {
		star.removeClass('saltie-rec-favorite');
		star.find('img').attr("src", require('../../../../theme/imgs/saltie-starfish.svg'));
	}

	star.on("click", () => {
		favorite = !favorite;
		if (favorite) {
			star.addClass('saltie-rec-favorite');
			star.find('img').attr("src", require('../../../../theme/imgs/saltie-starfish-white.svg'));
			rest.favorites.add(recommendation.tripId);
		} else {
			star.removeClass('saltie-rec-favorite');
			star.find('img').attr("src", require('../../../../theme/imgs/saltie-starfish.svg'));
			rest.favorites.delete(recommendation.tripId);
		}
	});

	arrow.on("click", () => {
		expand = !expand;
		if (expand) {
			arrow.addClass('saltie-rec-uparrow');
			if (detailItenerary === null) {
				// We must retrieve our recommendation detail
				rest.recommendations.getDetail(recommendation.tripId, (error, recommendation) => {
					if (error) {
						console.log(error);
						return;
					}

					// We are good to go with our recommendation
					detailItenerary = buildDetail(recommendation, cb);
					detail.append(detailItenerary);
				});
			} else {
				detail.append(detailItenerary);
			}
		} else {
			arrow.removeClass('saltie-rec-uparrow');
			detail.empty();
		}
	});

	return {
		html: item,
		handlers: ["click"]
	};
}

@Component({
    selector: 'recommendations',
    styles: [
		require('./recommendations.component.scss').toString()
    ],
    template: require('./recommendations.component.html'),
    directives: [MLButtonComponent, SaltieListComponent, EmailCruisesComponent]
})
export class RecommendationsComponent implements OnDestroy, OnInit {
	private header: ListHeader;
	private list: Array<any>;
	private values: Array<boolean>;
	private emailScreen: boolean;
	private shareTripLink: string;
	private shareTripDesc: string;

	constructor(private router: Router, private rest: RestService) {
		this.header = new ListHeader(
			'Cruise Concierge / Recommendations',
			'Cruise Recommendations',
			'We\'ve analyzed thousands of reviews by cruisers like you to find the highest rated cruise(s) to match your survey preferences.'
		);
		this.values = [false, false];
		this.list = new Array<any>();
		this.emailScreen = false;
	}

	ngOnInit() {
		let self = this;
		this.rest.recommendations.get((error, recommendations) => {
			if (error) {
				console.log(error);
				return;
			}

			this.list = recommendations.map((recommendation) => buildRecommendationItem(recommendation, this.rest, (tripId) => {
				self.emailScreen = true;
				self.rest.recommendations.tripLink(tripId, (err, result) => {
					self.shareTripLink = result.tripLink;
					self.shareTripDesc = result.tripDesc;
				})
				//self.shareTripLink = tripId;
			}));
		});
	}

	ngOnDestroy() {
		this.list.forEach((item) => {
			item.handlers.forEach(() => {
				item.html.off();
			});
		})
	}

	viewFavorites() {
		this.router.navigate(['Favorites']);
	}
}




