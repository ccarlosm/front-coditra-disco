import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ArtistsService } from '../../../../services/artists.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';

@Component({
	selector: 'app-add-lp',
	templateUrl: './add-lp.component.html',
	styleUrls: ['./add-lp.component.scss'],
})
export class AddLpComponent implements OnInit {

	@Input() artist: any;
	@Input() title: string = 'Edit LPs';
	@Input() confirmButtonText: string = 'Close';

	@ViewChild(MatPaginator) paginator!: MatPaginator;

	displayedColumns: string[] = ['name', 'description'];
	dataSource = new MatTableDataSource();

	constructor() { }

	ngOnInit() {
		this.subscription = this.userService.getUserData().subscribe(data => {
			this.userData = data;
			if (this.userData && this.userData.id) {
				this.loadData();
				this.isUserDataLoaded = true; // Set the flag to true when data is loaded and valid
			}
		});
	}

}
