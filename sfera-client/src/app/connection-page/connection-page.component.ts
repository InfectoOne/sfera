import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SignalingService } from '../signaling.service';
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
    private signalingService: SignalingService
  ) {}

  tryConnect() {
    this.signalingService.connect("localhost", 4000)
    this.router.navigate(["/peers"])
  }
}
