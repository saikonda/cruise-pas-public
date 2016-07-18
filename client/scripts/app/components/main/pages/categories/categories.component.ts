import { Component, ElementRef, Input, OnDestroy, OnInit } from 'angular2/core';

import { ListHeader } from '../../../../lib/ListHeader';
import { ListItem } from '../../../../lib/ListItem';

import { RestService } from '../../services/rest.service';
import { Categories, Category } from '../../services/rest/Categories';
import { BASE_URL } from '../../services/rest/constants';

import { MLButtonComponent } from '../../../ui_kit/mlbutton.component';
import { SaltieListComponent } from '../../../ui_kit/saltie-list.component';
import { SaltieHeaderComponent } from '../../../ui_kit/saltie-header.component';
import { SaltieCheckboxComponent } from '../../../ui_kit/saltie-checkbox.component';
import { Router } from 'angular2/router';

var $ = require('jquery');

let ls = require('local-storage');

function buildTravelListItem(category: Category, router: Router) {
    let handlers = new Array<string>();
    let questionsLength = category.questions ? category.questions.length : 0;
    let progress = category.questions ? category.progress : 100;
    let item = $(`
        <div class="row saltie-list-item-category">
            <div class="saltie-list-item-background"></div>
            <div class="saltie-list-item-category-content">
                <span style="margin-left: 15px; display: block;" class="saltie-mllarge saltie-weight-100 saltie-white">
                    ${category.title}
                </span>
                <span style="margin-left: 15px; display: block;" class="saltie-medium saltie-weight-100 saltie-white">
                    ${questionsLength} questions
                </span>
                <div style="margin-left: 15px; margin-top: 60px;">
                    <div class="saltie-white saltie-smedium saltie-weight-100" style="margin-bottom: 7px;">
                        ${Math.ceil(progress)}% Complete
                    </div>
                    <div class="saltie-progress-outer">
                        <div class="saltie-progress-inner" style="width: ${progress}%">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `)

    item.find('.saltie-list-item-background').css('background', `url('${BASE_URL}${category.image}')`)

    if (questionsLength > 0) {
        item.on("click", () => {
            router.navigate(['Questions', { category_id: category.category_id, index: 0 }])
        });

        handlers.push("click");
    }

    return {
        html: item,
        handlers: handlers
    };
}

@Component({
    selector: 'categories',
    styles: [
        require('./categories.component.scss').toString()
    ],
    template: require('./categories.component.html'),
    directives: [MLButtonComponent, SaltieListComponent],
    providers: []
})
export class CategoriesComponent implements OnDestroy, OnInit {
    private header: ListHeader;
    private list: Array<any>;
    private categories: [Category];
    private values: Array<boolean>;

    constructor(private router: Router, private rest: RestService) {
        this.header = new ListHeader(
            'Cruise Concierge /Categories',
            'Please answer questions in your favorite categories.',
            'This helps our Cruise Concierge make better recommendations.'
        );
        this.values = [false, false];
        this.list = [];
    }

    ngOnInit() {
        this.rest.categories.get((error, categories) => {
            if (error) {
                console.log(error);
                return;
            }

            this.categories = categories;
            this.list = this.categories.map(category => buildTravelListItem(category, this.router));
        });
    }

    ngOnDestroy() {
        this.list.forEach((item) => {
            item.handlers.forEach(() => {
                item.html.off();
            });
        })
    }

    recommendations() {
        this.router.navigate(['Recommendations']);
    }
}




