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
}

