import { Component, Input } from 'angular2/core';

@Component({
    selector: 'saltie-checkbox',
    styles: [],
    template: `
        <div class="saltie-checkbox-outer" (click)="value = !value">
            <div class="saltie-checkbox-inner" *ngIf="value">
            </div>
        </div>
    `
})
export class SaltieCheckboxComponent {
    @Input()
    value: boolean;

    constructor() {

    }
}