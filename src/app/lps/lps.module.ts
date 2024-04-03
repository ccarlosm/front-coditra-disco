import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LpsRoutingModule } from './lps-routing.module';
import { LpsComponent } from './lps.component';


@NgModule({
  declarations: [LpsComponent],
  imports: [
    CommonModule,
    LpsRoutingModule
  ],
  exports: [LpsComponent]
})
export class LpsModule { }
