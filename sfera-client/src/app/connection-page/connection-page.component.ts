import { Component } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-connection-page',
  templateUrl: './connection-page.component.html',
  styleUrls: ['./connection-page.component.scss']
})
export class ConnectionPageComponent {
  serverAddress = ""
  serverPort = 4000
  constructor(
    private router: Router,
  ) {}

  tryConnect() {
    console.log("woot")
    this.router.navigate(["/peers"])
  }
}
