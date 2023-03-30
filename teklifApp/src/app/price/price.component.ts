import {
  Component,
  OnInit,
  ɵConsole,
  ViewContainerRef,
  ViewChild,
  TemplateRef,
  ElementRef,
} from "@angular/core";
import { FormGroup, FormControl, Validators } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import * as moment from "moment";
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { CurrencyPipe, DecimalPipe } from "@angular/common";
import { UserService } from "../admin/User.service";
import { element } from "protractor";
import { group } from "@angular/animations";
import { zip } from "rxjs";
import { MatRadioChange } from "@angular/material/radio";
import { async } from "q";
import { runInThisContext } from "vm";
import { exit } from "process";
import { Xmb } from "@angular/compiler";



@Component({
  selector: "app-price",
  templateUrl: "./price.component.html",
  styleUrls: ["./price.component.css"],
})
export class PriceComponent implements OnInit {
  @ViewChild("progressTpl", { read: TemplateRef, static: true })
  progressTpl: TemplateRef<any>;
  @ViewChild("menu", { read: HTMLElement, static: true }) menu: HTMLElement;
  close: boolean = false;

  constructor(
    private http: HttpClient,
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef,
    public dialog: MatDialog,
    private decimalPipe: DecimalPipe,
    public userservice: UserService
  ) { }

  profileForm = new FormGroup({
    hotelname: new FormControl("", Validators.required),
    roomcount: new FormControl("", [Validators.required, Validators.min(0)]),
    packet: new FormControl(1, [Validators.required]),
    period: new FormControl(1, [Validators.required]),
    email: new FormControl("", [Validators.required]),
    phone: new FormControl("", Validators.required),
    authorized: new FormControl("", Validators.required),
    wantname: new FormControl(""),
    wantemail: new FormControl(""),
    wantphone: new FormControl(""),
    sellerEmailCheck: new FormControl(true),
    note: new FormControl(""),
  });

  public dataSource: any;
  public periodList: any;
  public periodListData: any
  public packetListData: any;
  public packetList: any;
  path: string = this.userservice.path;
  roomCount: number = 0;
  alertmessage: string;
  offer: boolean = false;
  totalpricefinal: any = 0;
  showpriceControl: boolean = true;
  overlayRef: OverlayRef;
  lang: any;
  langtrans: any;
  currentLang: string = "tr";
  currencycode: string = "€";
  currencyprefix: string = "EUR";




  openDialog() {
    // const dialogConfig = new MatDialogConfig();
    //dialogConfig.width ="30%";
    //this.dialog.open(DialogComponent,dialogConfig)
  }





  getOffer() {
    const data = this.userservice.userinfo;
    var mapForm = document.createElement("form");
    mapForm.target = "_blank";
    mapForm.method = "POST"; // or "post" if appropriate

    if (this.userservice.company == "elektraweb") {
      mapForm.action = "https://www.elektraweb.com/teklifapp/admin/tekliflist.php";
    }

    if (this.userservice.company == "elektraweben") {
      mapForm.action = "https://elektraweb.com/teklifapp/admin/offerlist.php";
    }

    if (this.userservice.company == "easypms") {
      mapForm.action = "https://www.easypms.com/offerapp/admin/offerlist.php";
    }


    var mapInput = document.createElement("input");
    mapInput.type = "hidden";
    mapInput.name = "username";
    mapInput.setAttribute("value", data.email);

    var mapInput2 = document.createElement("input");
    mapInput2.type = "hidden";
    mapInput2.name = "password";
    mapInput2.setAttribute("value", data.password);
    mapForm.appendChild(mapInput);
    mapForm.appendChild(mapInput2);

    document.body.appendChild(mapForm);
    mapForm.submit();


  }

  async ngOnInit() {

    if (this.userservice.userdata != null) {
      this.profileForm
        .get("wantphone")
        .setValue(this.userservice.userdata[0].tel);
      this.profileForm
        .get("wantemail")
        .setValue(this.userservice.userdata[0].email);
      this.profileForm
        .get("wantname")
        .setValue(this.userservice.userdata[0].name);
    }

    let endpoint;
    let langendpoint
    if (this.userservice.company == "elektraweb") {
      this.currentLang = "tr";
      this.currencycode = "€";
      this.currencyprefix = "EUR";
      langendpoint = this.path + "lang.php";
    }

    if (this.userservice.company == "elektraweben") {

      this.currentLang = "en";
      this.currencycode = "€";
      this.currencyprefix = "EUR";
      langendpoint = this.path + "lang-en.php";
    }

    if (this.userservice.company == "easypms") {
      this.currentLang = "en";
      this.currencycode = "€";
      this.currencyprefix = "EUR";
      langendpoint = this.path + "lang-en.php";
    }

    this.periodList = await this.http.get("https://www.elektraweb.com/priceapi/getapi.php?type=period", {}).toPromise();
    this.packetList = await this.http.get("https://www.elektraweb.com/priceapi/getapi.php?type=packet", {}).toPromise();
    this.packetListData = this.packetList.ResultSets[0];
    this.periodListData = this.periodList.ResultSets[0];

    this.http.get("https://www.elektraweb.com/priceapi/getapi.php?type=product", {}).subscribe((resp: any) => {
      this.dataSource = resp.ResultSets[0].map(x => {
        return {

          'pass': true,
          'packetfactor': this.packetListData[2].FACTOR,
          'period': 1,
          'discount': 0,
          'selected': false,
          "ORDERNO": x.ORDERNO,
          "CODE": x.CODE,
          "NAME": x.NAME,
          "DESCRIPTION": x.DESCRIPTION,
          "ROOMPRICE": x.ROOMPRICE,
          "BASEPRICE": x.BASEPRICE,
          "INSTALLATIONFEE": x.INSTALLATIONFEE,
          "USEFACTOR": x.USEFACTOR,
          "ID": x.ID,
          "selectedperiod": 1,
          "finalprice": 0,
        }

      });

    }, (error) => {
      alert(error.error)
    });




    this.http.get(langendpoint).subscribe((resp2) => {
      this.lang = resp2;
      let datam = this.lang.filter((x) => x[this.currentLang])[0];
      this.langtrans = datam[this.currentLang];
    });

  }

  logout() {
    this.userservice.login = false;
    this.userservice.userdata = null;
    location.reload();
  }

  progress() {
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      positionStrategy: this.overlay
        .position()
        .global()
        .centerHorizontally()
        .centerVertically(),
    });
    this.overlayRef.attach(
      new TemplatePortal(this.progressTpl, this.viewContainerRef)
    );
  }

  detachOverlay() {
    if (this.overlayRef) {
      this.overlayRef.detach();
    }
  }



  getPriceHtml(element, trans, type) {
    let discounttext;
    if (element.discount > 0) {
      let nodiscountt =
        element.finalprice +
        (element.finalprice / (100 - element.discount)) * element.discount;
      if (isFinite(nodiscountt) == false) {
        nodiscountt = 0;
      }

      discounttext =
        "( " +
        trans.discount +
        " " +
        element.discount +
        " ) " +
        '<span class="discountpricecss">' +
        this.decimalPipe.transform(nodiscountt.toFixed(2)) +
        " " +
        this.currencycode +
        "</span>" +
        "<br>";
    } else {
      discounttext = "";
    }



    let pricetext = "";

    if (type == 1) {
      pricetext =
        "<b>" +
        this.decimalPipe.transform((element.finalprice / 12).toFixed(2)) +
        "</b>" +
        " " +
        this.currencycode +
        "/" +
        trans.monthly +
        "<br>" +
        this.decimalPipe.transform((element.finalprice).toFixed(2)) +
        " " +
        this.currencycode;
    }


    if (element.INSTALLATIONFEE == null) {
      element.INSTALLATIONFEE = 0;
    }



    let html =
      '<tr><td style="width:50%;"><strong>' + element.NAME + "</strong>" + "</td>" +
      '<td><strong>' + this.decimalPipe.transform((element.INSTALLATIONFEE).toFixed(2)) + " " + this.currencycode + "</strong>" + "</td>" +
      '<td style="text-align: right;"><p style=text-align: right; padding: 0; margin: 0;>' +
      discounttext +
      pricetext +
      "</p></tr>";

    return html;
  }


  teklifGonder(process, message?) {
    let trans = this.langtrans[0];
    if (this.profileForm.valid) {
      if (this.dataSource.filter((x) => x.selected == true).length <= 0) {
        alert(message);
      } else {
        let formdata = this.profileForm.value;
        this.progress();
        let offerusername = "";
        let offerpassword = "";
        if (this.userservice.userinfo) {
          offerusername = this.userservice.userinfo.email;
          offerpassword = this.userservice.userinfo.password;
        }

        let t = new FormData();
        t.append("process", process);
        t.append("hotelname", formdata.hotelname);
        t.append("email", formdata.email);
        t.append("phone", formdata.phone);
        t.append("authorized", formdata.authorized);
        t.append("wantname", formdata.wantname);
        t.append("roomcount", formdata.roomcount);
        t.append("offerstate", "Teklif Gönderildi.");
        t.append("wantemail", formdata.wantemail);
        t.append("wantphone", formdata.wantphone);
        t.append("sellerEmailCheck", formdata.sellerEmailCheck);
        t.append("langparam", this.currentLang);
        t.append("username", offerusername);
        t.append("password", offerpassword);
        t.append("note", formdata.note);
        t.append("price", this.totalpricefinal.toFixed(2));

        let html = `

        <div class="InfoArea" style="
        display: inline-block;
    ">
        <div class="infoItem" style="
        background: red;
        color: white;
        padding: 5px;
        display: inline;
        border-radius: 5px;
    ">
          <label>Packet</label> <span>${this.packetListData.filter(x => x.FACTOR == this.profileForm.value.packet)[0].PACKAGENAME}</span>
        </div>
    
        <div class="infoItem" style="
        background: red;
        color: white;
        display: inline;
        padding: 5px;
        border-radius: 5px;
    ">
          <label>Period</label> <span>${this.profileForm.value.period} ${trans.year} </span>
        </div>
      </div>

      
        `;


        let AnnuallyData = this.dataSource.filter(x => x.BASEPRICE != null && x.ROOMPRICE != null && x.selected == true);

        if (AnnuallyData.length > 0) {
          html += '<div class="heading">' + trans.annualycharged + "</div>";
          html +=
            '<table class="w100"><thead><tr class="tableHead"><th class="coltab1">' +
            trans.productexplaniton +
            '</th><th class="coltab2">' +
            trans.setupprice +
            '</th><th class="coltab3">' +
            trans.price +
            " (" +
            this.currencycode +
            ")</th></tr></thead><tbody>";


          AnnuallyData.forEach((element) => {

            html += this.getPriceHtml(element, trans, 1);

          });

          html += "</tbody></table><br><br>";
        }


        let fixData = this.dataSource.filter(x => x.INSTALLATIONFEE > 0 && x.BASEPRICE == null && x.ROOMPRICE == null && x.selected == true);


        if (fixData.length > 0) {
          ///Sabit Ücretler
          html += '<div class="heading">' + trans.productchargedronce + "</div>"
          html +=
            '<table class="w100"><thead><tr class="tableHead"><th class="coltab1">' +
            trans.productexplaniton +
            '</th><th class="coltab2">' +
            trans.setupprice +
            '</th><th class="coltab3">' +
            trans.price +
            " (" +
            this.currencycode +
            ")</th></tr></thead><tbody>";


          fixData.forEach((element) => {

            html += this.getPriceHtml(element, trans, 2);

          });

          html += "</tbody></table><br><br>";
        }







        html +=
          '<table class="w100"><thead><tr class="tableHead"><th class="coltab1"></th><th class="coltab2"></th><th class="coltab3"></th></tr></thead><tbody>';
        html +=
          "<tr><td><strong>" +
          trans.grandtotal +
          ":</strong></td><td>---</td>" +
          '<td class="totals"><strong>' +
          this.decimalPipe.transform(this.totalpricefinal) + " " + this.currencycode + "</strong></td></tr>";

        html += "</tbody></table>";


        let messagebody = html;
        t.append("offer", messagebody);
        if (this.profileForm.valid) {
          this.http
            .post(this.path + "teklifgonder.php", t, { responseType: "json" })
            .subscribe((resp: any) => {
              if (resp.html) {
                var sourceHTML = resp.html;
                var source =
                  "data:application/vnd.ms-word;charset=utf-8," +
                  encodeURIComponent(sourceHTML);
                var fileDownload = document.createElement("a");
                document.body.appendChild(fileDownload);
                fileDownload.href = source;
                fileDownload.download = "teklif.doc";
                fileDownload.click();
                document.body.removeChild(fileDownload);
                this.detachOverlay();
              } else {
                if (resp.success) {
                  alert(trans.succesoffer);
                  this.detachOverlay();
                } else {
                  this.detachOverlay();
                  alert(resp.message);

                }
              }
            });
        }
      }
    } else {
      alert(trans.fillallfields);
    }
  }

  changeData(roomcount, id?) {

    let period = this.profileForm.value.period;
    let packet = this.profileForm.value.packet;

    if (roomcount == "" || roomcount == null || roomcount == undefined) {
      roomcount = 1;
    }

    this.dataSource.forEach(x => {
      if (x.selected) {
        let INSTALLATIONFEE = 0;
        if (x.INSTALLATIONFEE != null) {
          INSTALLATIONFEE = x.INSTALLATIONFEE;
        }
        let price = (((roomcount * x.ROOMPRICE * packet * period) + x.BASEPRICE) * (12 * ((100 - x.discount) / 100)));
        x.finalprice = price + INSTALLATIONFEE;
      }
    });

    this.totalfunction();

  }

  showControl() {
    if (this.profileForm.valid) {
      if (this.dataSource.filter((x) => x.selected == true).length > 0) {
        this.showpriceControl = false;
      }
    }
  }


  totalfunction() {
    let totalprice = 0;
    console.log(this.dataSource)
    this.dataSource.forEach((element) => {
      if (element.pass == true) {
        if (element.selected == true) {
          totalprice += element.finalprice
        }
      }
    });
    this.totalpricefinal = totalprice;
  }

  Invoice() {
    let trans = this.langtrans[0];
    let formdata = this.profileForm.value;

    this.http
      .post(
        this.path + "invoice.php",
        [
          {
            mydata: this.dataSource,
            roomcount: formdata.roomcount,
            currency: this.currencycode,
          },
        ],
        { responseType: "json" }
      )
      .subscribe((resp: any) => {
        console.log(resp);
        if (resp.html) {
          var sourceHTML = resp.html;

          var source =
            "data:application/vnd.ms-word;charset=utf-8," +
            encodeURIComponent(sourceHTML);
          var fileDownload = document.createElement("a");
          document.body.appendChild(fileDownload);
          fileDownload.href = source;
          fileDownload.download = "invoice.doc";
          fileDownload.click();
          document.body.removeChild(fileDownload);
          this.detachOverlay();
        } else {
          if (resp.success) {
            alert(trans.succesoffer);
            this.detachOverlay();
          }
        }
      });
  }

  closeCall() {
    this.close = false;
  }

  setDiscount(data) {
    if (this.dataSource.filter((x) => x.selected == true).length > 0) {
      this.dataSource
        .filter((x) => x.selected == true)
        .forEach((element) => {
          if (data.target.value > 0) {
            element.discount = parseInt(data.target.value);
          } else {
            element.discount = 0;

          }
        });
    } else {
      alert(
        "Önce ürünlerinizi seçmelisiniz. Ürün seçiminden sonra topla indirim uygulayabilirsiniz"
      );
      data.target.value = 0;
    }
  }
}
