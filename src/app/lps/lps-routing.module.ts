import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LpsComponent } from './lps.component';
import { NewEditComponent } from './components/modals/new-edit/new-edit.component';

const routes: Routes = [
  {
    path: '',
    component: LpsComponent,
  },
  {
    path: 'new-edit',
    component: NewEditComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LpsRoutingModule { }
