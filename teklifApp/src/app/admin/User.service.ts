import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class UserService implements CanActivate {
  constructor(private router: Router) {

    if (this.company == "elektraweb") {
      this.path = "https://www.elektraweb.com/teklifapp/";
      this.logo = "https://www.elektraweb.com/wp-content/uploads/2020/01/elektraweblogo.png";

      this.marketData = [
        { "MARKETNAME": "Yurt İçi", "MARKETTYPE": 1 },
        { "MARKETNAME": "Yurt Dışı", "MARKETTYPE": 2 }
      ];
      this.selectedmarket = 1;
    } else {
      this.marketData = [
        { "MARKETNAME": "ABROAD", "MARKETTYPE": 2 }
      ];
      this.selectedmarket = 2;

    }

    if (this.company == "elektraweben") {
      this.path = "https://www.elektraweb.com/offerapp/";
      this.logo = "https://www.elektraweb.com/wp-content/uploads/2020/01/elektraweblogo.png";

    }

    if (this.company == "easypms") {
      this.path = "https://www.easypms.com/offerapp/";
      this.logo = "https://www.easypms.com/offerapp/easypmslogo.png";

    }

  }
  public path: string; //"http://localhost/teklif/"; //"https://www.elektraweb.com/teklifapp/";
  public login: boolean = false;
  public userdata: any;
  public userinfo: any;
  public company: string = "elektraweben";  // elektraweb,easypms,elektraweben değerlerinden birini giriniz.
  public logo: string;
  public marketData: any;
  public selectedmarket:number;


  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.login == true) { return true; }
    this.router.navigate(["login"]);
    return false;
  }


}
