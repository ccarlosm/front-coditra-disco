import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { ArtistsService } from '../../../../services/artists.service';

@Component({
	selector: 'app-new-edit-artist',
	templateUrl: './new-edit.component.html',
	styleUrls: ['./new-edit.component.scss'],
})
export class NewEditComponent implements OnInit {
	@Input() artist: any;
	@Input() title: string = 'New Artist';
	@Input() confirmButtonText: string = 'Save';
	@Input() cancelButtonText: string = 'Cancel';

	artistForm: FormGroup;

	constructor(
		private modalCtrl: ModalController,
		private fb: FormBuilder,
		private artistsService: ArtistsService
	) {
		this.artistForm = this.fb.group({
			name: ['', [Validators.required, Validators.maxLength(50)]],
      		description: ['', [Validators.required, Validators.maxLength(256)]],
		});
	}

	ngOnInit() {
		if (this.artist) {
			this.artistForm.patchValue({
				name: this.artist.name,
				description: this.artist.description,
			});
		}
	}

	close(data: any = null) {
		this.modalCtrl.dismiss(data);
	}

	saveArtist() {
		if (this.artistForm.valid) {
			const formModel = this.artistForm.value;
			if (this.artist) {
				// Existing artist: update
				this.artistsService.update(this.artist.id, formModel).then(res => {
					console.log('Artist updated:', res);
					this.close(res);
				  }).catch(err => {
					console.error('Error updating artist:', err);
					this.close();
				  });
			} else {
				// New artist: create
				this.artistsService.create(formModel).then(res => {
					console.log('Artist created:', res);
					this.close(res);
				  }).catch(err => {
					console.error('Error creating artist:', err);
					this.close();
				  });
			}
		} else {
			console.error('Form not valid:', this.artistForm.value);
		}
	}
}
