import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { getAPIEndpoint } from '../shared/defines';

@Injectable({
	providedIn: 'root'
})
export class ArtistsService {

	constructor(
		private http: HttpClient
	) { }

	/**
	* List model
	*/
	public list(params: { order_by: string; direction :string; page: number; per_page: string; relationships: string; artistName?: string } | undefined): Promise<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + localStorage.getItem('access_token')
		});
		const options = {
			headers,
			params: new HttpParams({ fromObject: params as any })
		};

		return new Promise((resolve, reject) => {
			const url = getAPIEndpoint() + 'v1/artists';
			this.http.get<any>(url, options).subscribe({
				next: (data) => {
					resolve(data);
				},
				error: (error) => {
					reject(error);
				}
			});
		});
	}

	/**
	 * Detele model
	 */
	public delete(id: number): Promise<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + localStorage.getItem('access_token')
		});
		const options = {
			headers
		};

		return new Promise((resolve, reject) => {
			const url = getAPIEndpoint() + 'v1/artists/' + id;
			this.http.delete<any>(url, options).subscribe({
				next: (data) => {
					resolve(data);
				},
				error: (error) => {
					reject(error);
				}
			});
		});
	}

	/**
	 * Update model
	 */
	public update(id: number, data: any): Promise<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + localStorage.getItem('access_token')
		});
		const options = {
			headers
		};

		return new Promise((resolve, reject) => {
			const url = getAPIEndpoint() + 'v1/artists/' + id;
			this.http.put<any>(url, data, options).subscribe({
				next: (data) => {
					resolve(data);
				},
				error: (error) => {
					reject(error);
				}
			});
		});
	}

	/**
	 * Create model
	 */
	public create(data: any): Promise<any> {
		const headers = new HttpHeaders({
			'Content-Type': 'application/json',
			'Authorization': 'Bearer ' + localStorage.getItem('access_token')
		});
		const options = {
			headers
		};

		return new Promise((resolve, reject) => {
			const url = getAPIEndpoint() + 'v1/artists';
			this.http.post<any>(url, data, options).subscribe({
				next: (data) => {
					resolve(data);
				},
				error: (error) => {
					reject(error);
				}
			});
		});
	}
}

