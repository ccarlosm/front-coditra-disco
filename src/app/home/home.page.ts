import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AlertController, LoadingController } from '@ionic/angular';
import { LpsService } from '../services/lps.service';

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterViewInit {
	public selectedLength: number = 5;
	public page: number = 1;
	public column: string = 'id';
	public order: string = 'asc';
	public totalRecords: number = 0;

	displayedColumns: string[] = ['LP', 'artist', 'songs', 'authors'];
	dataSource = new MatTableDataSource();

	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	constructor(
		private lpsService: LpsService,
		private loadingCtrl: LoadingController,
		private alertController: AlertController,
	) { }

	ngOnInit() {
		this.loadData();
	}

	ngAfterViewInit() {
		this.dataSource.sort = this.sort;
		this.dataSource.paginator = this.paginator;

		// Paginator
		this.paginator.page.subscribe(async () => {
			this.page = this.paginator.pageIndex + 1;
			this.totalRecords = this.paginator.length;
			this.selectedLength = this.paginator.pageSize;

			await this.loadData();
		});

		// Sort
		this.sort.sortChange.subscribe(() => {
			if (this.sort.active === 'LP') {
				this.column = 'title';
			} else {
				this.column = this.sort.active;
			}
			this.order = this.sort.direction;
			this.loadData();
		});
	}

	async loadData({} = {}) {
		await this.list({
			order_by: this.column,
			direction: this.order,
			page: this.page,
			per_page: this.selectedLength.toString(),
			relationships: 'artist,songs.authors',
		});
	}

	private async list(params?: {
		order_by: string;
		direction: string;
		page: number;
		per_page: string;
		relationships: string;
	}) {
		let loading;

		try {
			loading = await this.loadingCtrl.create({});
			await loading.present();

			const response = await this.lpsService.list(params);
			const rawData = response.data;

			//Map data to a format that can be displayed in the table
			const transformedData = rawData.map((lp: { title: any; songs: string | any[], artist: { name: string }; }) => ({
				LP: lp.title,
				songs: Array.isArray(lp.songs) ? lp.songs.length : 0,
				authors: Array.isArray(lp.songs) ? this.getAuthorsList(lp.songs) : '',
				artist: Array.isArray(lp.artist) ? '' : lp.artist.name
			}));

			this.dataSource.data = transformedData;

			// Update pagination
			this.paginator.pageIndex = await response.current_page - 1;
			this.paginator.length = await response.total;
			this.paginator.pageSize = await response.per_page;

			await loading.dismiss();
		} catch (error) {
			const alert = await this.alertController.create({
				message: 'Error fetching LPs. Please try again.',
				buttons: [{ text: 'Ok' }],
			});

			await alert.present();
			console.error(error);
		} finally {
			if (loading) {
				await loading.dismiss();
			}
		}
	}

	// Función auxiliar para obtener una lista de nombres de autores separados por comas
	private getAuthorsList(songs: any[]): string {
		const authorsSet = new Set(); // Utilizar un Set para evitar nombres duplicados
		songs.forEach(song => {
			song.authors.forEach((author: { firstname: unknown; }) => {
				authorsSet.add(author.firstname);
			});
		});

		return Array.from(authorsSet).join(', ');
	}
}
