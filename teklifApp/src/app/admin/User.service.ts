import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService implements CanActivate  {
  constructor(private router : Router) { }
  login : boolean =false;
  public userdata : any;


  canActivate(next:ActivatedRouteSnapshot,state:RouterStateSnapshot):boolean {
    if(this.login ==true) {return true; }

    this.router.navigate(["login"]);
        return false;
  }





}
