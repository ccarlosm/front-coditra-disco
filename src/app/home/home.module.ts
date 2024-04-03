import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';


@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    HomePageRoutingModule,
    MatTableModule,
	  MatSortModule,
  ],
  declarations: [HomePage]
})
export class HomePageModule {}
