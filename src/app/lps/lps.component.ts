import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AlertController, LoadingController } from '@ionic/angular';
import { LpsService } from '../services/lps.service';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';

@Component({
	selector: 'app-lps',
	templateUrl: './lps.component.html',
	styleUrls: ['./lps.component.scss'],
})
export class LpsComponent implements OnInit, AfterViewInit {
	public selectedLength: number = 5;
	public page: number = 1;
	public column: string = 'id';
	public order: string = 'asc';
	public totalRecords: number = 0;
	public artistFilter: string = '';  // Store the artist filter

	public isUserDataLoaded: boolean = false;
	private subscription: Subscription | undefined;
	public userData: any;

	displayedColumns: string[] = ['LP', 'artist', 'songs', 'authors'];
	dataSource = new MatTableDataSource();

	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	constructor(
		private lpsService: LpsService,
		private loadingCtrl: LoadingController,
		private alertController: AlertController,
		public userService: UserService
	) { }

	ngOnInit() {
		this.subscription = this.userService.getUserData().subscribe(data => {
			this.userData = data;
			if (this.userData && this.userData.id) {
				this.loadData();
				this.isUserDataLoaded = true; // Set the flag to true when data is loaded and valid
			}
		});
	}

	private async loadData() {
		await this.list({
			order_by: this.column,
			direction: this.order,
			page: this.page,
			per_page: this.selectedLength.toString(),
			relationships: 'artist,songs.authors',
			artist_name: this.artistFilter,  // Pass the artist filter to the API
		});
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

	public applyFilter(event: Event) {
		const value = (event.target as HTMLInputElement).value;
		this.artistFilter = value.trim().toLowerCase();
		this.loadData();
	}


	private async list(params?: {
		order_by: string;
		direction: string;
		page: number;
		per_page: string;
		relationships: string;
		artist_name?: string;  // Add artist_name to the method parameters
	}) {
		let loading;

		try {
			loading = await this.loadingCtrl.create({
				message: 'Loading...',
				spinner: 'circles',
				cssClass: 'custom-loader-class',
			});
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

	// Function helper to get a list of author names separated by commas
	private getAuthorsList(songs: any[]): string {
		const authorsSet = new Set(); // Use a Set to avoid duplicate names
		songs.forEach(song => {
			song.authors.forEach((author: { firstname: unknown; }) => {
				authorsSet.add(author.firstname);
			});
		});

		return Array.from(authorsSet).join(', ');
	}
}
