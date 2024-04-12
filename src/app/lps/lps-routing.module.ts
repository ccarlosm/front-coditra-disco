import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LpsComponent } from './lps.component';

const routes: Routes = [
  {
    path: '',
    component: LpsComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LpsRoutingModule { }
