import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './shared/login/login.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ConfirmDialogComponent } from './shared/confirm-dialog/confirm-dialog.component';
import { NewEditComponent } from './artists/new-edit/new-edit.component';

@NgModule({
	declarations: [
		AppComponent,
		ConfirmDialogComponent,
		NewEditComponent
	],
	imports: [
		BrowserModule,
		IonicModule.forRoot(),
		AppRoutingModule,
		LoginComponent,
		HttpClientModule,
		FormsModule,
		ReactiveFormsModule
	],
	providers: [{ provide: RouteReuseStrategy, useClass: IonicRouteStrategy }, provideAnimationsAsync()],
	bootstrap: [AppComponent],
})
export class AppModule { }
