import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { SignalingService } from './signaling.service';

@Injectable({
  providedIn: 'root'
})
export class SignalingGuard implements CanActivate {

  constructor(private signalingService: SignalingService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const isConnected = this.signalingService.isConnected
    console.log("🚀 ~ file: signaling.guard.ts:18 ~ SignalingGuard ~ isConnected", isConnected)
    if (!isConnected) {
      const localStorageIp = localStorage.getItem(this.signalingService.LOCALSTORAGE_SERVERIP_KEY)
      const localStoragePort = localStorage.getItem(this.signalingService.LOCALSTORAGE_SERVERPORT_KEY)
      if (localStorageIp && localStoragePort && !Number.isNaN(localStoragePort)) {
        this.signalingService.connect(localStorageIp, Number(localStoragePort))
        if (state.url === "/") {
          this.router.navigate(['/peers'])
          return false
        } else {
          return true
        }
      } else {
        if (state.url === "/") {
          return true 
        } else {
          this.router.navigate(["/"])
          return false
        }
      }
    } else {
      if (state.url == "/") {
        this.router.navigate(['/peers'])
        return false
      } else {
        return true
      }
    }
  }
  
}
