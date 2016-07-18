import { Component, Input, ElementRef, AfterViewInit, OnChanges } from 'angular2/core';
import { ListItem } from '../../lib/ListItem';
import { ListHeader } from '../../lib/ListHeader';
import { SaltieHeaderComponent } from './saltie-header.component';

var $ = require('jquery');

@Component({
    selector: 'saltie-list',
    styles: [],
    template: `
        <div>
            <saltie-header [header]="header" [invert]="invert"></saltie-header>
            <div class="container saltie-list-container">
            </div>
        </div>
    `,
    directives: [SaltieHeaderComponent]
})
export class SaltieListComponent implements AfterViewInit, OnChanges {
    @Input()
    invert: boolean;

    @Input()
    header: ListHeader;

    @Input()
    list: Array<any>;

    constructor(private elementRef: ElementRef) {

    }

    ngOnChanges() {
        console.log("sensed change");
        console.log(this.list);
        $(this.elementRef.nativeElement).
            find('div.saltie-list-container').
            empty();

        this.list.forEach((item) => {
            (<any>$(this.elementRef.nativeElement)).
                find('div.saltie-list-container').
                append(item.html);
        });
    }

    ngAfterViewInit() {
        this.list.forEach((item) => {
            (<any>$(this.elementRef.nativeElement)).
                find('div.saltie-list-container').
                append(item.html);
        });
    }
}