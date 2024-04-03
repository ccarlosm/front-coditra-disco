import { Component, OnInit } from '@angular/core';

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

	selectedLength = '10';
	page = 1;
	column = 'id';
	order = 'asc';
	list: any;

	constructor() { }

	ngOnInit() {
		this.list({
			order: {
				column: this.column,
				order: this.order
			},
			page: this.page,
			per_page: this.selectedLength,
			relationships: ['artists,songs.authors']
		});
	}
}
