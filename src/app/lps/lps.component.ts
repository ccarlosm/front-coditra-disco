import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AlertController, LoadingController } from '@ionic/angular';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { ModalController } from '@ionic/angular';
import { LpsService } from '../services/lps.service';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';
import { NewEditComponent } from './components/modals/new-edit/new-edit.component';

@Component({
	selector: 'app-lps',
	templateUrl: './lps.component.html',
	styleUrls: ['./lps.component.scss'],
	animations: [
		trigger('detailExpand', [
			state('collapsed,void', style({ height: '0px', minHeight: '0' })),
			state('expanded', style({ height: '*' })),
			transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
		]),
	],
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

	displayedColumns: string[] = ['LP', 'artist', 'songs', 'authors', 'actions'];
	dataSource = new MatTableDataSource();
	expandedElement: any | null;

	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	constructor(
		private lpsService: LpsService,
		private loadingCtrl: LoadingController,
		private alertController: AlertController,
		public userService: UserService,
		public modalCtrl: ModalController
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
		const loading = await this.loadingCtrl.create({
			message: 'Loading...',
			spinner: 'circles',
			cssClass: 'custom-loader-class',
		});
		await loading.present();

		await this.list({
			order_by: this.column,
			direction: this.order,
			page: this.page,
			per_page: this.selectedLength.toString(),
			relationships: 'artist,songs.authors',
			artist_name: this.artistFilter,
		}).finally(() => {
			loading.dismiss();
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
			this.column = this.sort.active;
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

		try {
			const response = await this.lpsService.list(params);
			const rawData = response.data;

			//Map data to a format that can be displayed in the table
			const transformedData = rawData.map((lp: { id: number, title: any; description: string, songs: string | any[], artist: { name: string }; }) => ({
				id: lp.id,
				title: lp.title,
				description: lp.description,
				LP: lp.title,
				songs: Array.isArray(lp.songs) ? lp.songs.length : 0,
				authors: Array.isArray(lp.songs) ? this.getAuthorsList(lp.songs) : '',
				//If artists name exists get the name, otherwise set it to an empty string
				artist: lp.artist ? lp.artist.name : '',
			}));

			this.dataSource.data = transformedData;

			// Update pagination
			this.paginator.pageIndex = await response.current_page - 1;
			this.paginator.length = await response.total;
			this.paginator.pageSize = await response.per_page;
		} catch (error) {
			const alert = await this.alertController.create({
				message: 'Error fetching LPs. Please try again.',
				buttons: [{ text: 'Ok' }],
			});

			await alert.present();
			console.error(error);
		}
	}

	async editLp(lp: any) {
		try {
			const modal = await this.modalCtrl.create({
				component: NewEditComponent,
				cssClass: 'new-edit-modal',
				componentProps: {
					lp: lp,
					title: 'Edit Lp: ' + lp.title,
					confirmButtonText: 'Save',
					cancelButtonText: 'Cancel',
				}
			});

			await modal.present();

			// Handle the result when the modal is dismissed
			const { data } = await modal.onDidDismiss();
			if (data) {
				this.loadData(); // Only call loadData if there's data, implying successful update
			}
		} catch (error) {
			console.error('Error opening edit lp modal:', error);
			this.showAlert('Error opening edit lp dialog.');
		}
	}

	async createLp() {
		try {
			const modal = await this.modalCtrl.create({
				component: NewEditComponent,
				cssClass: 'new-edit-modal',
				componentProps: {
					title: 'New Lp',
					confirmButtonText: 'Create',
					cancelButtonText: 'Cancel',
				}
			});

			await modal.present();

			// Handle the result when the modal is dismissed
			const { data } = await modal.onDidDismiss();
			if (data) {
				this.loadData(); // Only call loadData if there's data, implying successful creation
			}
		} catch (error) {
			console.error('Error opening new lp modal:', error);
			this.showAlert('Error opening new lp dialog.');
		}
	
	}

	async deleteLp(lp: any) {
		try {
			const modal = await this.modalCtrl.create({
				component: ConfirmDialogComponent,
				cssClass: 'confirm-dialog',
				componentProps: {
					title: 'Delete LP',
					message: `Are you sure you want to delete ${lp.name}? This action cannot be undone.`,
					confirmButtonText: 'Delete',
					cancelButtonText: 'Cancel',
				}
			});

			await modal.present();

			const { data } = await modal.onWillDismiss();
			if (data) {
				this.delete(lp);
			}
		} catch (error) {
			console.error('Error presenting modal', error);
			this.showAlert('Error opening confirmation dialog.');
		}
	}


	private async delete(artist: any) {
		this.lpsService.delete(artist.id).then(() => {
			this.loadData();  // Refresh the list after delete
		}).catch((error: any) => {  // Explicitly typing the error parameter
			console.error('Error deleting artist:', error);
			this.showAlert('Error deleting artist. Please try again.');
		});
	}



	private async showAlert(message: string) {
		const alert = await this.alertController.create({
			message: message,
			buttons: ['OK']
		});
		await alert.present();
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
