import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { LpsService } from '../../../../services/lps.service';

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

	constructor(
		private modalCtrl: ModalController,
		private fb: FormBuilder,
		private lpsService: LpsService
	) {
		this.lpForm = this.fb.group({
			title: ['', [Validators.required, Validators.maxLength(50)]],
      		description: ['', [Validators.required, Validators.maxLength(256)]],
		});
	}

	ngOnInit() {
		if (this.lp) {
			console.log('LP:', this.lp);
			this.lpForm.patchValue({
				title: this.lp.title,
				description: this.lp.description,
			});
		}
	}

	close(data: any = null) {
		this.modalCtrl.dismiss(data);
	}

	saveLp() {
		if (this.lpForm.valid) {
			const formModel = this.lpForm.value;
			if (this.lp) {
				// Existing lp: update
				this.lpsService.update(this.lp.id, formModel).then(res => {
					console.log('Lp updated:', res);
					this.close(res);
				  }).catch(err => {
					console.error('Error updating lp:', err);
					this.close();
				  });
			} else {
				// New lp: create
				this.lpsService.create(formModel).then(res => {
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
