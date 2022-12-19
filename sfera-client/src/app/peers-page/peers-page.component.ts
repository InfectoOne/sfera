import { Component } from '@angular/core';
import { SignalingService } from '../signaling.service';

@Component({
  selector: 'app-peers-page',
  templateUrl: './peers-page.component.html',
  styleUrls: ['./peers-page.component.scss']
})
export class PeersPageComponent {
  constructor(
    public signalingService: SignalingService
  ) {}


}
