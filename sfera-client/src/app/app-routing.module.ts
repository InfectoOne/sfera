import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConnectionPageComponent } from './connection-page/connection-page.component';
import { PeersPageComponent } from './peers-page/peers-page.component';
const routes: Routes = [
  {path: "", component: ConnectionPageComponent},
  {path: "peers", component: PeersPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
