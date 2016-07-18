import { Component } from 'angular2/core';

@Component({
    selector: 'saltie-button-mlarge',
    styles: [
        `
            button {
                background: white;
                color: rgb(53, 150, 179);
                font-weight: 100;
                font-size: 23px;
                padding: 5px 20px;
                min-width: 200px;
                display: block;
                margin: auto;
                border: none;
            }
        `
    ],
    template: `
        <button class="saltie-mlarge">
            <ng-content></ng-content>
        </button>
    `
})
export class MLButtonComponent {
    constructor() {

    }
}