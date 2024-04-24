import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { AlertController, LoadingController } from '@ionic/angular';
import { ConfirmDialogComponent } from '../shared/confirm-dialog/confirm-dialog.component';
import { ModalController } from '@ionic/angular';
import { ArtistsService } from '../services/artists.service';
import { UserService } from '../services/user.service';
import { Subscription } from 'rxjs';
import { NewEditComponent } from './components/modals/new-edit/new-edit.component';

@Component({
	selector: 'app-artists',
	templateUrl: './artists.component.html',
	styleUrls: ['./artists.component.scss'],
	animations: [
		trigger('detailExpand', [
			state('collapsed,void', style({ height: '0px', minHeight: '0' })),
			state('expanded', style({ height: '*' })),
			transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
		]),
	],
})

export class ArtistsComponent implements OnInit, AfterViewInit {
	public selectedLength: number = 5;
	public page: number = 1;
	public column: string = 'id';
	public order: string = 'asc';
	public totalRecords: number = 0;
	public artistFilter: string = '';  // Store the artist filter

	public isUserDataLoaded: boolean = false;
	private subscription: Subscription | undefined;
	public userData: any;

	displayedColumns: string[] = ['name', 'description', 'lps', 'actions'];
	dataSource = new MatTableDataSource();
	expandedElement: any | null;

	@ViewChild(MatSort) sort!: MatSort;
	@ViewChild(MatPaginator) paginator!: MatPaginator;

	constructor(
		private ArtistsService: ArtistsService,
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
			relationships: 'lps',
			name: this.artistFilter,
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
		name?: string;
	}) {

		try {
			const response = await this.ArtistsService.list(params);
			const rawData = response.data;

			//Map data to a format that can be displayed in the table
			const transformedData = rawData.map((artist: { id: number, name: string, description: string, lps: [] }) => ({
				id: artist.id,
				name: artist.name,
				description: artist.description,
				lps: artist.lps,
				lpsCount: artist.lps.length
			}));

			this.dataSource.data = transformedData;

			// Update pagination
			this.paginator.pageIndex = await response.current_page - 1;
			this.paginator.length = await response.total;
			this.paginator.pageSize = await response.per_page;

		} catch (error) {
			const alert = await this.alertController.create({
				message: 'Error fetching Artists. Please try again.',
				buttons: [{ text: 'Ok' }],
			});

			await alert.present();
			console.error(error);
		}
	}

	async editArtist(artist: any) {
		try {
			const modal = await this.modalCtrl.create({
				component: NewEditComponent,
				cssClass: 'new-edit-modal',
				componentProps: {
					artist: artist,
					title: 'Edit Artist: ' + artist.name,
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
			console.error('Error opening edit artist modal:', error);
			this.showAlert('Error opening edit artist dialog.');
		}
	}

	async createArtist() {
		try {
			const modal = await this.modalCtrl.create({
				component: NewEditComponent,
				cssClass: 'new-edit-modal',
				componentProps: {
					title: 'New Artist',
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
			console.error('Error opening new artist modal:', error);
			this.showAlert('Error opening new artist dialog.');
		}
	
	}

	async deleteArtist(artist: any) {
		if (artist.lpsCount > 0) {
			this.showAlert('Artist has LPs, cannot be deleted. Delete the LPs first.');
			return;
		}

		try {
			const modal = await this.modalCtrl.create({
				component: ConfirmDialogComponent,
				cssClass: 'confirm-dialog',
				componentProps: {
					title: 'Delete Artist',
					message: `Are you sure you want to delete ${artist.name}? This action cannot be undone.`,
					confirmButtonText: 'Delete',
					cancelButtonText: 'Cancel',
				}
			});

			await modal.present();

			const { data } = await modal.onWillDismiss();
			if (data) {
				this.delete(artist);
			}
		} catch (error) {
			console.error('Error presenting modal', error);
			this.showAlert('Error opening confirmation dialog.');
		}
	}


	private async delete(artist: any) {
		this.ArtistsService.delete(artist.id).then(() => {
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
}

