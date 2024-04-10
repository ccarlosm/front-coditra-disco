import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { LpsRoutingModule } from './lps-routing.module';
import { LpsComponent } from './lps.component';


@NgModule({
  declarations: [LpsComponent],
  imports: [
    CommonModule,
    LpsRoutingModule,
    CommonModule,
    IonicModule,
    MatTableModule,
	  MatSortModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule
  ],
  exports: [LpsComponent]
})
export class LpsModule { }
