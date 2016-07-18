import { Component, Input } from 'angular2/core';
import { ListHeader } from '../../lib/ListHeader';

@Component({
    selector: 'saltie-header',
    styles: [],
    template: `
        <div style="line-height: normal; margin-bottom: -5px;" class="container" [ngClass]="{'saltie-header-container': !invert, 'saltie-header-container-invert': invert}">
            <div class="row saltie-small saltie-weight-500" style="opacity: .4;">
                {{header.path}}
            </div>
            <div class="row saltie-mllarge saltie-weight-200" style="margin-bottom: 10px;">
                {{header.title}}
            </div>
            <div class="row saltie-medium saltie-weight-100" style="margin-bottom: -10px;">
                {{header.content}}
            </div>
        </div>
    `
})
export class SaltieHeaderComponent {
    @Input()
    header: ListHeader;

    @Input()
    invert: boolean;

    constructor() {

    }
}