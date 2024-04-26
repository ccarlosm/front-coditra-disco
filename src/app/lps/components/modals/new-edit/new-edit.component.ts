import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { debounceTime, switchMap, startWith, filter } from 'rxjs/operators';
import { ArtistsService } from '../../../../services/artists.service'; // Update the import path as needed

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
	artists: any[] = [];

	constructor(
		private modalCtrl: ModalController,
		private fb: FormBuilder,
		private artistService: ArtistsService // Make sure to inject ArtistService
	) {
		this.lpForm = this.fb.group({
			title: ['', [Validators.required, Validators.maxLength(50)]],
			description: ['', [Validators.required, Validators.maxLength(256)]],
		});
	}

	ngOnInit() {
		if (this.lp) {
			this.lpForm.patchValue({
				title: this.lp.title,
				description: this.lp.description,
			});
			if (this.lp.artist_id) {
				this.artistService.get(this.lp.artist_id).then((artist: any) => {
					this.artistControl.setValue(artist); // You might need to adjust this depending on what you want to display
				}).catch((error: any) => console.error('Failed to fetch artist:', error));
			}
		}

		this.artistControl.valueChanges.pipe(
			startWith(''),
			debounceTime(300),
			filter(value => value.length > 0), // Ensure value has at least one character
			switchMap(value => this.artistService.list({
				name: value,
				page: 1,
				per_page: '5',
				order_by: 'name',
				direction: 'asc',
				relationships: 'none'
			}))
		).subscribe({
			next: (data) => {
				this.artists = data.items; // Adjust according to your actual API response
			},
			error: (error) => {
				console.error('Failed to fetch data:', error);
			}
		});
	}

	close(data: any = null) {
		this.modalCtrl.dismiss(data);
	}

	saveLp() {
		if (this.lpForm.valid) {
			const formModel = this.lpForm.value;
			if (this.lp) {
				this.artistService.update(this.lp.id, formModel).then(res => {
					console.log('Lp updated:', res);
					this.close(res);
				}).catch(err => {
					console.error('Error updating lp:', err);
					this.close();
				});
			} else {
				this.artistService.create(formModel).then(res => {
					console.log('Lp created:', res);
					this.close(res);
				}).catch(err => {
					console.error('Error creating lp:', err);
					this.close();
				});
			}
		} else {
			console.error('Form not valid:', this.lpForm.value);
		}
	}
}
