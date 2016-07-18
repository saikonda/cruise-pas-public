import { Component, ElementRef, Input, OnDestroy, OnInit } from 'angular2/core';

import { ListHeader } from '../../../../lib/ListHeader';
import { ListItem } from '../../../../lib/ListItem';

import { MLButtonComponent } from '../../../ui_kit/mlbutton.component';
import { SaltieListComponent } from '../../../ui_kit/saltie-list.component';
import { SaltieHeaderComponent } from '../../../ui_kit/saltie-header.component';
import { SaltieCheckboxComponent } from '../../../ui_kit/saltie-checkbox.component';
import { Router } from 'angular2/router';

import { Traveling, Travel } from '../../services/rest/traveling';
import { Survey, SURVEY } from '../../services/rest/survey';
import { BASE_URL } from '../../services/rest/constants';
import { RestService } from '../../services/rest.service';

var $ = require('jquery');
var count = 0;
var ls = require('local-storage');

function buildTravelListItem(travel: Travel, survey: Survey, wt: any) {
	let item = $(`
		<div class="row saltie-list-item" style="padding-left: 10px;">
			<div class="saltie-list-item-background"></div>
			<div class="salite-list-item-background-fade">
				<div style="top: 10px; position: relative;" class="saltie-checkbox-outer">
		            <span class="icon-check saltie-checkbox">
		            </span>
		        </div>
	            <span style="margin-left: 10px; font-size: 22px;" class="saltie-mllarge saltie-weight-100 saltie-white">
					${travel.text}
				</span>
			</div>
        </div>
	`)

	item.find('.saltie-list-item-background').css('background', `url('${BASE_URL}${travel.image_url}')`)
	item.find('.saltie-list-item-background').css('background-size', 'cover');

	item.find('.icon-check').css('visibility', survey.answer(travel.question_id) === SURVEY.liked ? 'visible' : 'hidden');

	item.on("click", () => {
		survey.toggle_like(travel.question_id);
		item.find('.icon-check').css('visibility', survey.answer(travel.question_id) === SURVEY.liked ? 'visible' : 'hidden');
		if (survey.answer(travel.question_id) === SURVEY.liked) {
			wt.count++;
			ls('count_t', wt.count);
		} else {
			wt.count--;
			ls('count_t', wt.count);
		}
	});

	return {
		html: item,
		handlers: ["click"]
	};
}

@Component({
    selector: 'whos-traveling',
    styles: [
    	require('./whos-traveling.component.scss').toString()
    ],
    template: require('./whos-traveling.component.html'),
    directives: [MLButtonComponent, SaltieListComponent]
})
export class WhosTravelingComponent implements OnDestroy {
	private header: ListHeader;
	private list: Array<any>;
	public count: number;

	constructor(private router: Router, private rest: RestService) {
		this.header = new ListHeader(
			'Cruise Concierge /Travelers',
			'Who\'s Traveling?',
			'You may select more than one'
		);

		this.list = new Array();
		this.count = ls('count_t') ? ls('count_t') : 0;
	}

	ngOnInit() {
		this.rest.traveling.get((error, traveling) => {
			if (error) {
				console.log(error);
				return;
			}
			this.list = traveling.map(_traveling => buildTravelListItem(_traveling, this.rest.survey, this));
		});
	}

	ngOnDestroy() {
		this.list.forEach((item) => {
			item.handlers.forEach(() => {
				item.html.off();
			});
		})
	}

	regions() {
		if (this.count < 1) return;
		this.router.navigate(['Categories']);
		//this.router.navigate(['RegionTraveling']);
	}
}




