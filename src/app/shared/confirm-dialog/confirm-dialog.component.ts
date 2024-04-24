import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
	selector: 'app-confirm-dialog',
	templateUrl: './confirm-dialog.component.html',
	styleUrls: ['./confirm-dialog.component.scss'],
})
export class ConfirmDialogComponent implements OnInit {

	@Input() title: string = 'Confirm Action';
	@Input() message: string = 'Are you sure you want to do this?';
	@Input() confirmButtonText: string = 'Confirm';
	@Input() cancelButtonText: string = 'Cancel';

	constructor(private modalController: ModalController) { }

	ngOnInit() { }

	close(result: boolean) {
		this.modalController.dismiss(result);
	}
}
