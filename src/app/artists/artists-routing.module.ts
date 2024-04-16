import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ArtistsComponent } from './artists.component';
import { NewEditComponent } from './new-edit/new-edit.component';

const routes: Routes = [
	{
		path: '',
		component: ArtistsComponent,
	},
	{
		path: 'new',
		component: NewEditComponent,
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class ArtistsRoutingModule { }
