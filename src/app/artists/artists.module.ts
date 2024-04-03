import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

import { ArtistsRoutingModule } from './artists-routing.module';
import { ArtistsComponent } from './artists.component';


@NgModule({
  declarations: [ArtistsComponent],
  imports: [
    CommonModule,
    IonicModule,
    ArtistsRoutingModule
  ],
  exports: [ArtistsComponent]
})
export class ArtistsModule { }
