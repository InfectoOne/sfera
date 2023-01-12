import { NgModule } from "@angular/core"
import { BrowserModule } from "@angular/platform-browser"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { AppRoutingModule } from "./app-routing.module"

import { AppComponent } from "./app.component"
import { ConnectionPageComponent } from "./connection-page/connection-page.component"
import { PeersPageComponent } from "./peers-page/peers-page.component"

import { BrowserAnimationsModule } from "@angular/platform-browser/animations"
import {MatButtonModule} from "@angular/material/button"
import {MatInputModule} from "@angular/material/input"
import {MatFormFieldModule} from "@angular/material/form-field"
import {MatCheckboxModule} from "@angular/material/checkbox"
import {MatToolbarModule} from "@angular/material/toolbar" 
import {MatIconModule} from "@angular/material/icon" 
import {MatCardModule} from "@angular/material/card" 
import {MatChipsModule} from "@angular/material/chips"
import {MatProgressSpinnerModule} from "@angular/material/progress-spinner" 
import {MatSnackBarModule} from "@angular/material/snack-bar" 
import { PeerChipComponent } from "./peer-chip/peer-chip.component"

@NgModule({
	declarations: [
		AppComponent,
		ConnectionPageComponent,
		PeersPageComponent,
		PeerChipComponent
	],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		BrowserAnimationsModule,
		MatButtonModule,
		MatInputModule,
		MatFormFieldModule,
		MatCheckboxModule,
		MatToolbarModule,
		MatIconModule,
		MatCardModule,
		MatChipsModule,
		MatProgressSpinnerModule,
		MatSnackBarModule
	],
	providers: [],
	bootstrap: [AppComponent]
})
export class AppModule { }
