import { Component, OnInit } from "@angular/core"
import { FormControl, FormGroup, Validators } from "@angular/forms"
import { MatSnackBar } from "@angular/material/snack-bar"
import { Router } from "@angular/router"
import { SignalingService } from "../signaling/signaling.service"
@Component({
	selector: "app-connection-page",
	templateUrl: "./connection-page.component.html",
	styleUrls: ["./connection-page.component.scss"]
})
export class ConnectionPageComponent implements OnInit{
	remember = false

	public connectionForm: FormGroup

	constructor(
		private router: Router,
		private signalingService: SignalingService,
		private _snackBar: MatSnackBar
	) {
		this.connectionForm = new FormGroup({
			serverAddress: new FormControl("", [Validators.required, Validators.maxLength(20)]),
			serverPort: new FormControl("", [Validators.required, Validators.maxLength(5)]),
		})
	}

	ngOnInit(): void {
		this.connectionForm = new FormGroup({
			serverAddress: new FormControl("", [Validators.required, Validators.maxLength(20)]),
			serverPort: new FormControl("", [Validators.required, Validators.maxLength(5)]),
			remember: new FormControl("")
		})
	}

	get serverAddress() { return this.connectionForm.get("serverAddress") }
	get serverPort() { return this.connectionForm.get("serverPort") }

	validate (controlName: string, errorName: string) {
		return !this.connectionForm.controls[controlName].hasError(errorName)
	}


	async tryConnect() {
		this.connectionForm.markAllAsTouched()
		if (this.connectionForm.valid) {
			try {
				await this.signalingService.connect(this.serverAddress?.value, this.serverPort?.value, this.remember)
				this.router.navigate(["/peers"])
			} catch (err) {
				this._snackBar.open("Could not connect to server!", "", { duration: 4000 })
			}
		}
	}
}
