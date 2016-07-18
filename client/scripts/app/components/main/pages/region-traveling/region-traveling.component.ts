import { Component, ElementRef, Input, OnDestroy } from 'angular2/core';

import { ListHeader } from '../../../../lib/ListHeader';
import { ListItem } from '../../../../lib/ListItem';

import { MLButtonComponent } from '../../../ui_kit/mlbutton.component';
import { SaltieListComponent } from '../../../ui_kit/saltie-list.component';
import { SaltieHeaderComponent } from '../../../ui_kit/saltie-header.component';
import { SaltieCheckboxComponent } from '../../../ui_kit/saltie-checkbox.component';
import { Router } from 'angular2/router';

import { Regions, REGIONS } from '../../services/rest/regions';
import { RestService } from '../../services/rest.service';

var $ = require('jquery');

var ls = require('local-storage');

function buildTravelListItem(content: string, regions: Regions, value: number, rt: any) {
	let buildTravelItem = $(`
		<div class="row saltie-list-item">
			<div style="position: relative; top: 10px;" class="saltie-checkbox-outer">
	            <span class="icon-check saltie-checkbox">
	            </span>
	        </div>
            <span style="margin-left: 10px;" class="saltie-mllarge saltie-weight-100 saltie-white">
				${content}
			</span>
        </div>
	`)

	buildTravelItem.find('.icon-check').css('visibility', regions.has(value) ? 'visible' : 'hidden');

	buildTravelItem.on("click", () => {
		regions.toggle(value);
		buildTravelItem.find('.icon-check').css('visibility', regions.has(value) ? 'visible' : 'hidden');
		if (regions.has(value)) {
			rt.count++;
			ls('count_r', rt.count);
		} else {
			rt.count--;
			ls('count_r', rt.count);
		}
	});

	return {
		html: buildTravelItem,
		handlers: ["click"]
	};
}

@Component({
    selector: 'region-traveling',
    styles: [
		require('./region-traveling.component.scss').toString()
    ],
    template: require('./region-traveling.component.html'),
    directives: [MLButtonComponent, SaltieListComponent]
})
export class RegionTravelingComponent implements OnDestroy {
	private header: ListHeader;
	private list: Array<any>;
	private regions: Regions;
	public count: number;

	constructor(private router: Router, private rest: RestService) {
		this.header = new ListHeader(
			'Cruise Conceirge /Regions',
			'What regions are you interested in?',
			'You may select more than one.'
		);
		this.regions = rest.regions;
		this.count = ls('count_r') ? ls('count_r') : 0;
		this.list = [
			buildTravelListItem('Carribean', this.regions, REGIONS.Carribean, this),
			buildTravelListItem('Central America', this.regions, REGIONS.CentralAmerica, this),
			buildTravelListItem('New England', this.regions, REGIONS.NewEngland, this),
			buildTravelListItem('Pacific Northwest', this.regions, REGIONS.PacificNorthwest, this),
			buildTravelListItem('Alaska', this.regions, REGIONS.Alaska, this)
		];
	}

	ngOnDestroy() {
		this.list.forEach((item) => {
			item.handlers.forEach(() => {
				item.html.off();
			});
		})
	}

	categories() {
		if (this.count < 1) return;
		this.router.navigate(['Categories']);
	}
}




