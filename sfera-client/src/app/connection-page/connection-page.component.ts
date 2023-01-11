import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SignalingService } from '../signaling/signaling.service';
@Component({
  selector: 'app-connection-page',
  templateUrl: './connection-page.component.html',
  styleUrls: ['./connection-page.component.scss']
})
export class ConnectionPageComponent {
  serverAddress = ""
  serverPort = 4000
  remember = false
  constructor(
    private router: Router,
    private signalingService: SignalingService
  ) {}

  async tryConnect() {
    await this.signalingService.connect(this.serverAddress, this.serverPort, this.remember)
    this.router.navigate(["/peers"])
  }
}
