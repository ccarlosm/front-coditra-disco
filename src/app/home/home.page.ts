import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertController, LoadingController } from '@ionic/angular';
import { LpsService } from '../services/lps.service';

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

	displayedColumns: string[] = ['LP', 'artist', 'songs', 'authors'];
	dataSource = new MatTableDataSource([]);

	@ViewChild(MatSort, { static: true }) sort: MatSort | undefined;
	
	constructor(
        private lpsService: LpsService,
        private loadingCtrl: LoadingController,
		private alertController: AlertController
    ) {
    }

	ngOnInit() {
		this.list({
			order_by: this.column,
			direction: this.order,
			page: this.page,
			per_page: this.selectedLength,
			relationships: ['artist,songs.authors']
		});
		if (this.sort) {
			this.dataSource.sort = this.sort;
		}
	}

	private async list(params?: { order_by: string; direction :string; page: number; per_page: string; relationships: string[]; }) {
		let loading;

		try {
			loading = await this.loadingCtrl.create({});
			loading.present();

			const data = await this.lpsService.list(params);
			this.dataSource = new MatTableDataSource(data.data.data);

			loading.dismiss();
		} catch (error) {
			const alert = await this.alertController.create({
				message: 'Error fetching LPs. Please try again.',
				buttons: [
					{ text: 'Ok' }
				]
			});

			if (loading) {
				loading.dismiss();
			}
			await alert.present();
			console.error(error);
		}
	}
}
