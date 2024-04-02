import { Component, OnInit } from '@angular/core';
import { LoadingController, ModalController, ToastController } from '@ionic/angular';
import { UserService } from '../../services/user.service';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-login',
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
	standalone: true,
	imports: [
		FormsModule,
		IonicModule,
	],
})
export class LoginComponent implements OnInit {

	public login = {
		email: '',
		password: ''
	};

	constructor(
		private loadingCtrl: LoadingController,
		private userSRV: UserService,
		private toastCtrl: ToastController,
		private modalCtrl: ModalController
	) {
	}

	ngOnInit() {
		//Load the user information if we have a token
		if (localStorage.getItem('access_token') !== null) {
			this.getUserInformation();
		}
	}

	/**
	 * Performs the login
	 */
	public async doLogin() {
		//Show the loading spinner
		const loading = await this.loadingCtrl.create({});
		loading.present();

		//Send the request to the server
		this.userSRV.doLogin(this.login.email, this.login.password).then(
			(data) => {
				if (data.success) {
					localStorage.setItem('access_token', data.data.token);
					this.getUserInformation();
					this.modalCtrl.dismiss();
				} else {
					this.showLoginError();
				}
				//Hide the loading spinner
				loading.dismiss();
			}
		).catch(
			(error) => {
				//Hide the loading spinner
				loading.dismiss();

				this.showLoginError();

				//Debug to the console
				console.error(error);
			}
		);
	}

	/**
	 * Re-usable error message
	 */
	private showLoginError() {
		//Show a toast message error with a static message
		this.toastCtrl.create({
			color: 'danger',
			position: 'bottom',
			message: 'Login failed. Please try again.',
			duration: 3000
		}).then(toast => {
			toast.present();
		});
	}

	/**
	 * From userService, get the user information using getCurrentUser
	 * @private
	 */
	private getUserInformation() {
		this.userSRV.getCurrentUser().then(
			(data) => {
				this.userSRV.setUserData(data);
			}
		);
	}
}
