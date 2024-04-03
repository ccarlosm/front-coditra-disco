import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { LoginComponent } from './shared/login/login.component';
import { UserService } from './services/user.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';


@Component({
	selector: 'app-root',
	templateUrl: 'app.component.html',
	styleUrls: ['app.component.scss']
})
export class AppComponent {
	isLoggedIn = false; // Change based on user authentication status
	selectedSegment = 'home';
	public userData: Observable<any>;

	constructor(
		private modalCtrl: ModalController,
		private userService: UserService,
		private router: Router
	) {
		this.checkIfLoggedIn();
		this.userData = this.userService.getUserData();
	}

	/**
	 * Navigate to a specific path
	 * 
	 * @param path 
	 */
	public navigateTo(path: string) {
		this.router.navigate([`/${path}`]);
	}

	/**
	 * This function will check if we have a token stored, if not, will prompt for login
	 *
	 */
	private checkIfLoggedIn() {
		if (localStorage.getItem('access_token') == null) {
			this.openLoginModal();
		} else {
			this.getUserInformation();
			this.navigateTo('home');
		}
	}

	/**
	 * Shows the login modal
	 */
	private async openLoginModal() {
		const loginModal = await this.modalCtrl.create({
			component: LoginComponent,
			cssClass: 'login-modal'
		});

		//When closed, check if the loging is correct, if not, reopen the modal
		loginModal.onDidDismiss().then(() => {
			this.checkIfLoggedIn();
		});

		//Show the modal
		await loginModal.present();
	}

	/**
	 * From userService, get the user information using getCurrentUser
	 * @private
	 */
	private getUserInformation() {
		this.userService.getCurrentUser().then(
			(data) => {
				this.userService.setUserData(data['data']);
			}
		);
	}


	/**
	 * Do logout
	 */
	public doLogout() {
		this.userService.doLogout();
	}
}
