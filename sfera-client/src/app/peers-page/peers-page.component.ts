import { Component } from '@angular/core';

@Component({
  selector: 'app-peers-page',
  templateUrl: './peers-page.component.html',
  styleUrls: ['./peers-page.component.scss']
})
export class PeersPageComponent {
  peerList = ["Furious Bunny", "Sympathetic Piranha", "Anarchist Comodo"]
}
