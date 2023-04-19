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
    market: new FormControl(this.userservice.selectedmarket),
  });


  category: any = [
    {
      "displayField": "Temel",
      "key": 0
    },
    {
      "displayField": "Ek",
      "key": 1
    },
    {
      "displayField": "Yardımcı",
      "key": 2
    }
  ];

  categoryen: any = [
    {
      "displayField": "Temel",
      "key": 0
    },
    {
      "displayField": "Ek",
      "key": 1
    },
    {
      "displayField": "Yardımcı",
      "key": 2
    }
  ];


  public dataSourceGroup: any;
  public rawData: any;
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
  public totalfixpricefinal: any = 0;
  public annuallytotalpricefinal: any = 0;
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
      this.rawData = resp.ResultSets[0].map(x => {

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
          "SHOWQUANTITY": x.SHOWQUANTITY,
          "CATEGORYID": x.CATEGORYID,
          "quantity": 1,
          "ABROAD": x.ABROAD,
          "NAME_EN": x.NAME_EN,
          "HIDE_IN_PRICE_LIST": x.HIDE_IN_PRICE_LIST,
          "MINPRICE": x.MINPRICE,
          "USERPRICE": x.USERPRICE,
          "usercount": 1
        }
      });

      this.GetData();
    }, (error) => {
      alert(error.error)
    });




    this.http.get(langendpoint).subscribe((resp2) => {
      this.lang = resp2;
      let datam = this.lang.filter((x) => x[this.currentLang])[0];
      this.langtrans = datam[this.currentLang];
    });
  }


  GetData() {
    let groupData = [];
    let categoryler = [];
    this.rawData.forEach(element => {
      if (!element.HIDE_IN_PRICE_LIST) {
        if (this.profileForm.value.market == 1) {
          let cat = categoryler.filter(x => x == element.CATEGORYID);
          groupData.push(element);

        } else {
          //Yurt dışı Fiyatlar İçin
          this.periodListData = this.periodListData.map(x => {
            return {
              "NAME": x.NAME.replace("Yıl", "Year"), "PERIODFACTOR": x.PERIODFACTOR, "ID": x.ID
            }
          });

          if (element.ABROAD == true) {
            element.BASEPRICE = element.BASEPRICE * 2;
            element.NAME = element.NAME_EN || element.NAME
            groupData.push(element);
          }
        }
      }
    });


    this.dataSource = groupData;
    console.log(this.dataSource)
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


  getDiscountText(element, trans) {

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

    return discounttext;

  }

  getPriceHtml(element, trans, type) {
    let discounttext = this.getDiscountText(element, trans)


    if (element.INSTALLATIONFEE == null) {
      element.INSTALLATIONFEE = 0;
    }

    let pricetext = "";
    let quantitytext = "";



    if (element.quantity > 0 && element.SHOWQUANTITY) {
      quantitytext += "<span>" + element.quantity + " " + trans.quantity + "</span>";
    }

    if (element.usercount > 0 && element.USERPRICE > 0) {
      quantitytext += "<span>" + element.usercount + " " + trans.user + "</span>";
    }





    if (type == 1) {
      pricetext =
        "<b>" +
        this.decimalPipe.transform((element.finalprice).toFixed(2)) +
        " " +
        this.currencycode;
      "</b>";

      this.annuallytotalpricefinal += element.finalprice;

    }


    //Tek Sefer Ücretlendirelecek Ürünler
    if (type == 2) {
      pricetext =
        this.decimalPipe.transform((element.finalprice).toFixed(2)) + " " + this.currencycode;
      this.totalfixpricefinal += element.finalprice;
    }

    let html =
      '<tr><td style="width:50%;"><strong>' + element.selectedProduct + "</strong>" + " " + quantitytext + "</td>" +
      '<td style="text-align: right;"><p style=text-align: right; padding: 0; margin: 0;>' +
      discounttext +
      pricetext +
      "</p></tr>";


    return html;
  }


  teklifGonder(process, message?) {
    this.annuallytotalpricefinal = 0;
    this.totalfixpricefinal = 0;

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
        t.append("packet", this.packetListData.filter(x => x.FACTOR == this.profileForm.value.packet)[0].PACKAGENAME);
        t.append("period", Math.round(this.profileForm.value.period).toString());


        let html = "";
        let AnnuallyData = this.dataSource.filter(x => x.BASEPRICE != null && x.ROOMPRICE != null && x.selected == true);

        if (AnnuallyData.length > 0) {
          //Her Yıl Alınan Ücretler
          html += '<div class="heading">' + trans.annualycharged + "</div>";
          html +=
            '<table class="w100"><thead><tr class="tableHead"><th class="coltab1">' +
            trans.productexplaniton +
            '</th><th class="coltab2">' +
            trans.price +
            " (" +
            this.currencycode +
            ")</th></tr></thead><tbody>";


          AnnuallyData.forEach((element) => {
            html += this.getPriceHtml(element, trans, 1);
          });

          html +=
            "<tr><td><strong>" +
            trans.total +
            ":</strong></td>" +
            '<td class="totals"><strong>' +
            this.decimalPipe.transform(this.annuallytotalpricefinal) + " " + this.currencycode + "</strong></td></tr>";
          html += "</tbody></table><br><br>";
        }


        let fixData = this.dataSource.filter(x => x.INSTALLATIONFEE > 0 && (x.BASEPRICE == null || x.BASEPRICE == 0) && x.ROOMPRICE == null && x.selected == true);
        if (fixData.length > 0) {
          ///Sabit Ücretler
          html += '<div class="heading">' + trans.productchargedronce + "</div>"
          html +=
            '<table class="w100"><thead><tr class="tableHead"><th class="coltab1">' +
            trans.productexplaniton +
            '</th><th class="coltab2">' +
            trans.price +
            " (" +
            this.currencycode +
            ")</th></tr></thead><tbody>";


          fixData.forEach((element) => {
            html += this.getPriceHtml(element, trans, 2);
          });

          html +=
            "<tr><td><strong>" +
            trans.total +
            ":</strong></td>" +
            '<td class="totals"><strong>' +
            this.decimalPipe.transform(this.totalfixpricefinal) + " " + this.currencycode + "</strong></td></tr>";

          html += "</tbody></table><br><br>";
        }



        html +=
          '<table class="w100"><thead><tr class="tableHead"><th class="coltab1"></th><th class="coltab2"></th></tr></thead><tbody>';
        html +=
          "<tr><td><strong>" +
          trans.grandtotal +
          ":</strong></td>" +
          '<td class="totals"><strong>' +
          this.decimalPipe.transform(this.totalpricefinal) + " " + this.currencycode + "</strong></td></tr>";

        html += "</tbody></table>";
        html += `

        <style>
        .infosBar div {
          display: flex;
          justify-content: space-between;
          margin:20px 0px;
      }
      
      .infosBar {
          font-weight: 700;
      }</style>

    <div class="infosBar">
        <div>
            <span>${trans.firstyear} </span><span>${this.decimalPipe.transform(this.totalpricefinal) + " " + this.currencycode}</span>
        </div>

        <div>
            <span>${trans.otheryear} </span><span>${this.decimalPipe.transform(this.annuallytotalpricefinal) + " " + this.currencycode}</span>
        </div>
    </div>

        `;

        t.append("fixprice", this.totalfixpricefinal.toFixed(2));



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


  changeData(roomcount, val?, type?) {

    let period = this.profileForm.value.period;
    let packet = this.profileForm.value.packet;
    if (roomcount == "" || roomcount == null || roomcount == undefined) { roomcount = 1; }

    this.dataSource = this.dataSource.map((x) => {
      let roomprice = 0;
      if (x.selected) {
        let INSTALLATIONFEE = 0;
        if (x.INSTALLATIONFEE != null) {
          INSTALLATIONFEE = x.INSTALLATIONFEE;
        }


        if (x.USERPRICE == null) { x.USERPRICE = 0 }
        if (x.usercount == null) { x.usercount = 0 }



        if (roomcount * x.ROOMPRICE < x.MINPRICE) {
          roomprice = x.MINPRICE
        } else {
          roomprice = roomcount * x.ROOMPRICE * packet;
        }


        let price = (((roomprice * period) + x.BASEPRICE + x.USERPRICE * x.usercount) * (12 * ((100 - x.discount) / 100)));
        if (x.quantity > 0) {
          price = price + (INSTALLATIONFEE * x.quantity);
        } else {
          price = price + (INSTALLATIONFEE * 1);
        }
        x.finalprice = price
        x.selectedProduct = x.NAME;


      }

      return {
        'pass': true,
        'packetfactor': this.packetListData[2].FACTOR,
        'period': x.period,
        'discount': x.discount,
        'selected': x.selected,
        "ORDERNO": x.ORDERNO,
        "CODE": x.CODE,
        "NAME": x.NAME,
        "DESCRIPTION": x.DESCRIPTION,
        "ROOMPRICE": x.ROOMPRICE,
        "BASEPRICE": x.BASEPRICE,
        "INSTALLATIONFEE": x.INSTALLATIONFEE,
        "USEFACTOR": x.USEFACTOR,
        "ID": x.ID,
        "selectedperiod": x.selectedperiod,
        "finalprice": x.finalprice,
        "SHOWQUANTITY": x.SHOWQUANTITY,
        "CATEGORYID": x.CATEGORYID,
        "quantity": x.quantity,
        "grupData": x.grupData,
        "finalpricegrup": x.finalpricegrup,
        "type": x.type,
        "CATNAME": x.CATNAME,
        "gruped": x.gruped,
        "selectedProduct": x.selectedProduct,
        "ABROAD": x.ABROAD,
        "NAME_EN": x.NAME_EN,
        "HIDE_IN_PRICE_LIST": x.HIDE_IN_PRICE_LIST,
        "MINPRICE": x.MINPRICE,
        "USERPRICE": x.USERPRICE,
        "usercount": x.usercount
      }


    });

    this.totalfunction();
    console.log(this.dataSource)

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
