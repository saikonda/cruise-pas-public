import { Component, ElementRef, OnInit } from 'angular2/core';
import { ROUTER_DIRECTIVES, RouteConfig, Router, Location } from 'angular2/router';
import { FORM_PROVIDERS, FORM_DIRECTIVES, Control } from 'angular2/common';
import { HTTP_PROVIDERS, JSONP_PROVIDERS }    from 'angular2/http';

import {SlideAnimation} from './directives/slide-animation/slide-animation.directive';

import { RestService } from './services/rest.service';

import { StartComponent } from './pages/start/start.component';
import { WhosTravelingComponent } from './pages/whos-traveling/whos-traveling.component';
import { RegionTravelingComponent } from './pages/region-traveling/region-traveling.component';
import { CategoriesComponent } from './pages/categories/categories.component';
import { RecommendationsComponent } from './pages/recommendations/recommendations.component';
import { AlgorithmsComponent } from './pages/algorithms/algorithms.component';
import { QuestionsComponent } from './pages/questions/questions.component';
import { ViewFavoritesComponent } from './pages/view-favorites/view-favorites.component';

import { MLButtonComponent } from '../ui_kit/mlbutton.component';

var $ = require('jquery');
let ls = require('local-storage');
let moment = require('moment');
let days = moment(new Date()).diff(moment(ls('now')), 'days');

// Clear out local storage if greater than 1 day
if (days > 0) {
	window.location.hash = "/";
	ls.clear();
}

// Set our timer to now
ls('now', moment().format());

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

@RouteConfig([
	{ path: '/', component: StartComponent,	name: 'Start', useAsDefault: true },
	{ path: '/whos-traveling', component: WhosTravelingComponent, name: 'WhosTraveling' },
	{ path: '/region-traveling', component: RegionTravelingComponent, name: 'RegionTraveling' },
	{ path: '/categories', component: CategoriesComponent, name: 'Categories' },
	{ path: '/recommendations', component: RecommendationsComponent, name: 'Recommendations' },
	{ path: '/algorithms', component: AlgorithmsComponent, name: 'Algorithms' },
	{ path: '/questions', component: QuestionsComponent, name: 'Questions' },
	{ path: '/favorites', component: ViewFavoritesComponent, name: 'Favorites' }
])
@Component({
    selector: 'main',
    styles: [],
    template: require('./main.component.html'),
    providers: [HTTP_PROVIDERS, JSONP_PROVIDERS, RestService],
    directives: [MLButtonComponent, ROUTER_DIRECTIVES, SlideAnimation]
})
export class MainComponent implements OnInit {
	private element: any;
	private showBack: boolean;
	private navigationBack: string;
	private hideNavigation: boolean;

	constructor (private router: Router, private elementRef: ElementRef, private location: Location) {
		this.hideNavigation = false;
		this.element = $(this.elementRef.nativeElement);
		this.navigationBack = '';
		this.showBack = false;
		$('body').append($(
			`
				<style type="text/css">
					${require('../../theme/main.scss').toString()}
				</style>
			`
		))
	}

	ngOnInit() {
		this.router.subscribe(
			(url) => {
				switch (url) {
					case '':
						this.showBack = false;
						this.navigationBack = 'Start';
						break;
					case 'whos-traveling':
						this.showBack = true;
						this.navigationBack = 'Start';
						break;
					case 'categories':
						this.showBack = true;
						this.navigationBack = 'WhosTraveling';
						break;
					case 'recommendations':
						this.showBack = true;
						this.navigationBack = 'Categories';
						break;
					case 'favorites':
						this.showBack = true;
						this.navigationBack = 'Recommendations';
					default:
						this.showBack = true;
						if (url.indexOf('question') > -1) {
							this.navigationBack = 'Categories';
						}
						break;
				}
			}
		)
		let count = 'hide-navigation='.length;
		let index = window.location.href.indexOf('hide-navigation=');
		if (index > 0) {
			this.hideNavigation= window.location.href.substr(index + count, 1) === 't';
		}
	}

	closeMenu() {
		this.element.find('.saltie-menu').hide();
	}

	openMenu() {
		this.element.find('.saltie-menu').show();
	}

	back() {
		this.element.find('.saltie-menu').hide();
		this.router.navigate([this.navigationBack]);
	}

	navigate(page: string) {
		this.element.find('.saltie-menu').hide();
		this.router.navigate([page]);
	}
}