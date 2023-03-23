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
  public company: string = "elektraweb";  // elektraweb,easypms,elektraweben değerlerinden birini giriniz.
  public logo: string;
  public loginTokenVal = "ae75876ce48fb32939057cab5720556a5bc00c0f7d4b3f81fc19bcfa828ec9ca34b0fc3501b3d8f8e158d636af72511233a7ca0b57d785da935ce735d04089bd2c8446a372306b8508cc5267b4a411cd0d2f1f8e88c930a8dac4a52b5c4c731cf45f33ceada3c4078e8045da1b790849670a2cc7deff0b9015daa3077c94188267d1cc69bd0ba4d92d687b4baf7989e659b698a1d1e7f704a1f5d07a824903a93997e2a0c6329f1377f136d8399e20e072ea896e156836e8cfcc835dca90a888cd319a4b0c922a347702ded9d25e7f14";
  public hotelID = 19544;

  public productListConfig = {
    Action: "Select",
    Object: "STDMODULE",
    Select: [
      "CODE",
      "NAME",
      "DESCRIPTION",
      "ROOMPRICE",
      "BASEPRICE",
      "ORDERNO",
      "ID",
      "INSTALLATIONFEE",
      "USEFACTOR"
    ],
    Where: [
      {
        Column: "HOTELID",
        Operator: "=",
        Value: this.hotelID
      }
    ],
    OrderBy: [
      {
        Column: "ORDERNO",
        Direction: "ASC"
      }
    ],
    Paging: {
      ItemsPerPage: 100,
      Current: 1
    },
    TotalCount: false,
    Joins: [],
    LoginToken: this.loginTokenVal
  }



  periodListConfig = {
    Action: "Select",
    Object: "HOTEL_PRICEOFFER_PERIOD",
    Select: [
      "NAME",
      "PERIODFACTOR",
      "ID"
    ],
    Where: [
      {
        Column: "HOTELID",
        Operator: "=",
        Value: this.hotelID
      }
    ],
    OrderBy: [
      {
        Column: "null",
        Direction: null
      }
    ],
    Paging: {
      Current: 1,
      ItemsPerPage: 10000
    },
    Joins: [],
    LoginToken: this.loginTokenVal
  }


  packetListConfig = {
    Action: "Select",
    Object: "HOTEL_PRICEOFFER_PACKAGETYPE",
    Select: [
      "FACTOR",
      "PACKAGENAME",
      "ID"
    ],
    Where: [
      {
        Column: "HOTELID",
        Operator: "=",
        Value: this.hotelID
      }
    ],
    OrderBy: [
      {
        Column: "null",
        Direction: null
      }
    ],
    Paging: {
      Current: 1,
      ItemsPerPage: 10000
    },
    Joins: [],
    LoginToken: this.loginTokenVal
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.login == true) { return true; }
    this.router.navigate(["login"]);
    return false;
  }


}
