import { NgModule } from "@angular/core"
import { RouterModule, Routes } from "@angular/router"
import { ConnectionPageComponent } from "./connection-page/connection-page.component"
import { PeersPageComponent } from "./peers-page/peers-page.component"
import { SignalingGuard } from "./signaling/signaling.guard"
import { SignalingService } from "./signaling/signaling.service"

const routes: Routes = [
	{path: "", title: "Sfera | Connect", component: ConnectionPageComponent, canActivate : [SignalingGuard] },
	{path: "peers", title: "Sfera | Peers", component: PeersPageComponent, canActivate : [SignalingGuard] }
]

@NgModule({
	imports: [RouterModule.forRoot(routes)],
	exports: [RouterModule],
	providers: [SignalingService, SignalingGuard]
})
export class AppRoutingModule { }
