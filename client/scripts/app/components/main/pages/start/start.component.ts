import { Component } from 'angular2/core';
import { Router } from 'angular2/router';


import { MLButtonComponent } from '../../../ui_kit/mlbutton.component';

@Component({
    selector: 'start',
    styles: [],
    template: require('./start.component.html'),
    directives: [MLButtonComponent]
})
export class StartComponent {
	constructor (private router: Router) { }

	begin() {
		this.router.navigate(['WhosTraveling']);
	}
}