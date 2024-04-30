import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { debounceTime, switchMap, startWith, filter, catchError } from 'rxjs/operators';
import { Observable, of, from } from 'rxjs';
import { ArtistsService } from '../../../../services/artists.service'; // Update the import path as needed
import { LpsService } from 'src/app/services/lps.service';

@Component({
	selector: 'app-new-edit-lp',
	templateUrl: './new-edit.component.html',
	styleUrls: ['./new-edit.component.scss'],
})
export class NewEditComponent implements OnInit {
	@Input() lp: any;
	@Input() title: string = 'New Lp';
	@Input() confirmButtonText: string = 'Save';
	@Input() cancelButtonText: string = 'Cancel';

	lpForm: FormGroup;
	artistControl = new FormControl();
	filteredArtists: Observable<any[]> | undefined;

	constructor(
		private modalCtrl: ModalController,
		private fb: FormBuilder,
		private artistService: ArtistsService,
		private lpService: LpsService
	) {
		this.lpForm = this.fb.group({
			title: ['', [Validators.required, Validators.maxLength(50)]],
			description: ['', [Validators.required, Validators.maxLength(256)]],
			artist_id: []
		});
	}

	async ngOnInit() {
		if (this.lp) {
			this.lpForm.patchValue({
				title: this.lp.title,
				description: this.lp.description,
			});

			if (this.lp.artist_id) {
				try {
					const artist = await this.artistService.get(this.lp.artist_id);
					this.artistControl.setValue(artist.data);
				} catch (error) {
				}
			}
		}

		this.filteredArtists = this.artistControl.valueChanges.pipe(
			startWith(''),
			debounceTime(300),
			filter(value => typeof value === 'string' && value.length > 0),
			switchMap(value => this.searchArtists(value)),
			catchError(err => {
				console.error('Error in autocomplete search:', err);
				return of([]);
			})
		);
	}

	searchArtists(value: string): Observable<any[]> {
		return from(this.artistService.list({
			name: value,
			page: 1,
			per_page: '5',
			order_by: 'name',
			direction: 'asc',
			relationships: ''
		}).then(response => response.data));  // Adjust here to access the data field
	}

	displayFn(artist: any): string {
		return artist ? artist.name : '';
	}

	close(data: any = null) {
		this.modalCtrl.dismiss(data);
	}

	saveLp() {
		if (this.lpForm.valid) {
			const formModel = this.lpForm.value;
			// Extract artist ID from the artist object stored in artistControl
			formModel.artist_id = this.artistControl.value ? this.artistControl.value.id : null;

			if (this.lp) {
				this.lpService.update(this.lp.id, formModel).then(res => {
					this.close(res);
				}).catch(err => {
					console.error('Error updating LP:', err);
					this.close();
				});
			} else {
				this.lpService.create(formModel).then(res => {
					this.close(res);
				}).catch(err => {
					console.error('Error creating LP:', err);
					this.close();
				});
			}
		} else {
			console.error('Form not valid:', this.lpForm.value);
		}
	}
}
