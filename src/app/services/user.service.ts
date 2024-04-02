import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { getAPIEndpoint } from '../shared/defines';
import { Observable, BehaviorSubject } from 'rxjs';

interface UserData {
	success: boolean;
	data: any;
}

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private userDataSubject: BehaviorSubject<UserData | null> =
		new BehaviorSubject<UserData | null>(null);

	constructor(private http: HttpClient) { }

	public doLogin(email: string, password: string): Promise<UserData> {
		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		const options = { headers };

		return new Promise((resolve, reject) => {
			this.http
				.post<UserData>(
					`${getAPIEndpoint()}login`,
					{ email, password },
					options
				)
				.subscribe({
					next: (data) => {
						this.setUserData(data);
						resolve(data);
					},
					error: (error) => {
						reject(error);
					},
				});
		});
	}

	public doLogout(): void {
		localStorage.removeItem('access_token');
		this.setUserData({ success: false, data: null });

		const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
		const options = { headers };

		this.http
			.post(`${getAPIEndpoint()}logout`, {}, options)
			.subscribe({
				next: () => {
					this.clearUserData();
				},
				error: () => {
					this.clearUserData();
				},
				complete: () => {
					window.location.reload();
				},
			});
		

	}

	public clearUserData(): void {
		this.userDataSubject.next(null);
	}

	public setUserData(userData: UserData): void {
		this.userDataSubject.next(userData);
	}

	public getUserData(): Observable<UserData | null> {
		return this.userDataSubject.asObservable();
	}

	public getCurrentUser(relationships: string[] = []): Promise<UserData> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: `Bearer ${localStorage.getItem('access_token')}`,
		});
		const options = { headers };
		const relationshipQuery = relationships
			.map((r) => `relationships[]=${r}`)
			.join('&');
		const endpoint = `${getAPIEndpoint()}user${relationships.length ? `?${relationshipQuery}` : ''
			}`;

		return new Promise((resolve, reject) => {
			this.http.get<UserData>(endpoint, options).subscribe({
				next: (data) => {
					this.setUserData(data);
					resolve(data);
				},
				error: (error) => {
					reject(error);
				},
			});
		});
	}
}
