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
import { Overlay, OverlayRef } from "@angular/cdk/overlay";
import { TemplatePortal } from "@angular/cdk/portal";
import { MatDialog, MatDialogConfig } from "@angular/material/dialog";
import { CurrencyPipe, DecimalPipe } from "@angular/common";
import { UserService } from "../admin/User.service";

import { DialogComponent } from "./dialog/dialog.component";

export interface PeriodicElement {
  productname: string;
  id: number;
  roomprice: any;
  total: number;
  selected: boolean;
  desc: string;
  productgrup: any;
  fixuse: boolean;
  firstprice: any;
}

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
  tempData: any;

  constructor(
    private http: HttpClient,
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef,
    public dialog: MatDialog,
    private decimalPipe: DecimalPipe,
    public userservice: UserService
  ) {}

  profileForm = new FormGroup({
    hotelname: new FormControl("", Validators.required),
    roomcount: new FormControl(0),
    email: new FormControl("", [Validators.required, Validators.email]),
    phone: new FormControl("", Validators.required),
    authorized: new FormControl("", Validators.required),
    wantname: new FormControl(""),
    wantemail: new FormControl(""),
    wantphone: new FormControl(""),
    extranote: new FormControl(""),
    sellerEmailCheck: new FormControl(true),
    setdiscount: new FormControl("", [Validators.max(10), Validators.min(0)]),
  });

  public dataSource: any;
  public Config: any;
  path: string = "";
  currentLang: string = "tr";
  currencycode: string = "$";
  currencyprefix: string = "$";
  roomCount: number = 0;
  alertmessage: string;
  offer: boolean = false;
  totalpricefinal: number = 0;
  firstprice: number = 0;
  showpriceControl: boolean = true;
  overlayRef: OverlayRef;
  ekhizmetler: any;
  hardware: any;
  hardwaretotal: number;
  setupprice: any;
  setuppricetotal: number = 0;
  yearlyfixpricetotal: number = 0;
  yearlyfixsinglepricetotal: number = 0;
  lang: any;
  langtrans: any;
  public CroomCount1: number = 40;
  public CroomCount2: number = 400;
  public Cminroomcount: number = 40; /* Minumum Oda Sayısı */

  elementdata: PeriodicElement[] = [];

  openDialog($data) {
    this.dialog.open(DialogComponent, {
      data: {
        desc: $data,
      },
    });
  }

  langChange(val) {
    this.currentLang = val.value;
    let datam = this.lang.filter((x) => x[this.currentLang])[0];
    this.langtrans = datam[this.currentLang];
    this.dataSource = this.tempData[0][this.currentLang];
  }

  getOffer() {
    const data = this.userservice.userinfo;
    var mapForm = document.createElement("form");
    mapForm.target = "_blank";
    mapForm.method = "POST"; // or "post" if appropriate
    mapForm.action = "/admin//tekliflist.php";

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

    /* this.http.post("https://elektraotel.com/teklifapp/admin//tekliflist.php",getoffer).subscribe(resp=>{
      window.open("https://elektraotel.com/teklifapp/admin//tekliflist.php","_blank");
  }) 
 */
  }

  ngOnInit() {
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

    this.http
      .get(
        "https://raw.githubusercontent.com/sinankandis/TeklifFormu/master/hardware.json"
      )
      .subscribe((resp) => {
        this.tempData = this.elementdata = resp as any;
        this.dataSource = this.tempData[0][this.currentLang];
      });

    this.http.get(this.path + "langh.php").subscribe((resp2) => {
      this.lang = resp2;
      let datam = this.lang.filter((x) => x[this.currentLang])[0];
      this.langtrans = datam[this.currentLang];
    });

    this.total(0);
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
        t.append("extranote", formdata.extranote);
        
        let html = "";
        let checkdata = this.dataSource.filter(
          (x) =>
            x.selected &&
            !(
              x.timesequence == "yearlyfix" ||
              x.timesequence == "yearlyfixsingle" ||
              x.timesequence == "yearly"
            )
        );
        if (checkdata.length > 0) {
          html += '<div class="heading">' + trans.annualycharged + "</div>";
          html +=
            '<table class="w100"><thead><tr class="tableHead"><th class="coltab1">' +
            trans.productexplaniton +
            '</th><th class="coltab2">' +
            trans.roomcount +
            '</th><th class="coltab3">' +
            trans.price +
            " (" +
            this.currencycode +
            ")</th></tr></thead><tbody>";
        }
        let total = 0;
        let monthlytotal = 0;
        this.dataSource.forEach((element) => {
          if (element.selected) {
            if (
              !(
                element.timesequence == "yearlyfix" ||
                element.timesequence == "yearlyfixsingle" ||
                element.timesequence == "yearly"
              )
            ) {
              let altgrup = "";
              element.productgrup.forEach((x) => {
                if (x.selected == true && x.type != "hardware") {
                  let discounttext3 = "";
                  if (x.discount > 0) {
                    discounttext3 =
                      (
                        x.productprice * x.quantity -
                        ((x.productprice * x.quantity) / 100) * x.discount
                      ).toFixed(2) +
                      " " +
                      this.currencycode +
                      " ( %" +
                      x.discount +
                      " " +
                      trans.discountraw +
                      " )";
                  }
                  altgrup +=
                    x.productname +
                    "<br>" +
                    " ( " +
                    x.quantity +
                    " Quantity X " +
                    x.productprice +
                    " " +
                    this.currencycode +
                    " " +
                    " = " +
                    x.productprice * x.quantity +
                    " " +
                    this.currencycode +
                    " )" +
                    "<br><b><span>" +
                    discounttext3 +
                    "</span></b><hr>";
                }
              });

              let fixprice = element.roomprice[0].fixprice;
              let fixstring = "";
              if (fixprice > 0) {
                fixstring =
                  element.firstprice[0].desc +
                  fixprice +
                  " " +
                  this.currencycode +
                  " ";
              }

              let discounttext;
              if (element.discount > 0) {
                let nodiscountt =
                  element.total +
                  (element.total / (100 - element.discount)) * element.discount;
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

              let product = "";
              if (element.singleproduct == true) {
                product =
                  "( " +
                  element.quantity +
                  " " +
                  trans.quantity +
                  " * " +
                  element.price +
                  " " +
                  this.currencycode +
                  " ) " +
                  this.decimalPipe.transform(element.quantity * element.price) +
                  " " +
                  this.currencycode +
                  "";
              }

              monthlytotal += element.total;
              let pricetext = "";
              if (element.timesequence == "yearly") {
                pricetext =
                  "<b>" +
                  this.decimalPipe.transform(element.total) +
                  "</b>" +
                  " " +
                  this.currencycode +
                  "/" +
                  trans.year +
                  "";
              }

              if (element.timesequence == "yearlyfix") {
                pricetext =
                  "<b>" +
                  this.decimalPipe.transform(element.total) +
                  "</b>" +
                  " " +
                  this.currencycode +
                  "/ilkyıl ";
              }

              if (element.timesequence == "yearlyfixsingle") {
                pricetext =
                  "<b>" +
                  this.decimalPipe.transform(element.total) +
                  "</b>" +
                  " " +
                  this.currencycode +
                  "/ilkyıl ";
              } else {
                pricetext =
                  "<b>" +
                  this.decimalPipe.transform(element.total / 12) +
                  "</b>" +
                  " " +
                  this.currencycode +
                  "/" +
                  trans.monthly +
                  "<br>" +
                  this.decimalPipe.transform(element.total) +
                  " " +
                  this.currencycode +
                  "/" +
                  trans.year;
              }

              let usertext = "";
              if (element.hasOwnProperty("userbarems") && element.userbarems) {
                if (element.userbarems.selected) {
                  let selected = element.userbarems.selected;
                  if (element.useramountmod == true) {
                    usertext = element.userlabel + "<br> " + selected.name;
                  } else {
                    usertext = selected.name;
                  }
                }
              }

              html +=
                '<tr><td style="width:50%;"><strong>' +
                element.productname +
                "</strong><p>";
              "<br>" +
                product +
                "</p>" +
                "<p>" /*fixstring*/ +
                "<br>" +
                altgrup +
                usertext +
                "</p>" +
                "</td>" +
                "<td>" +
                element.count +
                "</td>" +
                '<td style="text-align: right;"><p style=text-align: right; padding: 0; margin: 0;>' +
                discounttext +
                pricetext +
                "</p></tr>";
            }
          }
        });

        if (checkdata.length > 0) {
          html +=
            "<tr><td><strong>" +
            trans.yearlytotal +
            " :</strong></td><td></td>" +
            '<td style="text-align: right;"><strong>' +
            " " +
            this.currencycode +
            "" +
            this.decimalPipe.transform(monthlytotal) +
            "</strong></td></tr>";
          html += "</tbody></table><br><br>";
        }

        let ekhizmetler = "";
        this.ekhizmetler.forEach((x) => {
          if (x.selected == true && x.firstprice[0].price > 0) {
            ekhizmetler +=
              trans.services +
              " : " +
              x.firstprice[0].desc +
              "  " +
              this.decimalPipe.transform(x.firstprice[0].price) +
              " " +
              this.currencycode +
              "<br>";
          }
        });

        let hardware = "";
        this.hardware.forEach((x) => {
          let discounttext2 = "";
          if (x.discount > 0) {
            discounttext2 =
              "<b>" +
              this.decimalPipe.transform(
                (
                  x.productprice * x.quantity -
                  ((x.productprice * x.quantity) / 100) * x.discount
                ).toFixed(2)
              ) +
              " " +
              this.currencycode +
              " ( %" +
              x.discount +
              " " +
              trans.discountraw +
              " )</b>";
          }
          hardware +=
            x.productname +
            "<br>" +
            " ( " +
            x.quantity +
            " Quantity X " +
            this.decimalPipe.transform(x.productprice) +
            " " +
            this.currencycode +
            " " +
            " = " +
            this.decimalPipe.transform(x.productprice * x.quantity) +
            " " +
            this.currencycode +
            " )" +
            "<br><span>" +
            discounttext2 +
            "</span><hr><br>";
        });

        let setupprice = "";
        this.setupprice.forEach((x) => {
          setupprice +=
            x.setupdesc +
            "<br>" +
            "( " +
            x.quantity +
            " * " +
            this.decimalPipe.transform(x.setupprice) +
            " " +
            this.currencycode +
            " )" +
            this.decimalPipe.transform(x.quantity * x.setupprice) +
            " " +
            this.currencycode +
            "";
        });

        let checkdatafix = this.dataSource.filter(
          (x) =>
            x.selected &&
            (x.timesequence == "yearlyfix" ||
              x.timesequence == "yearlyfixsingle" ||
              x.timesequence == "yearly")
        );

        if (
          checkdatafix.length > 0 ||
          this.ekhizmetler.length > 0 ||
          this.hardware.length > 0 ||
          this.setupprice.length > 0
        ) {
          html +=
            '<div class="heading">' + trans.productchargedronce + "</div>";
          html +=
            '<table class="w100"><thead><tr class="tableHead"><th class="coltab1">' +
            trans.productexplaniton +
            '</th><th class="coltab2">' +
            trans.quantityprice +
            '</th><th>'+trans.roomcount+'</th><th class="coltab3">' +
            trans.price +
            " (" +
            this.currencycode +
            ")</th></tr></thead><tbody>";
        }

        /* Tek Seferlik ve Sabit Ücterler Toplamı */
        let fixlytotal = 0;
        this.dataSource.forEach((element) => {
          if (element.selected) {
            if (
              element.timesequence == "yearlyfix" ||
              element.timesequence == "yearlyfixsingle" ||
              element.timesequence == "yearly"
            ) {
              let altgrup = "";
              element.productgrup.forEach((x) => {
                if (x.selected == true && x.type != "hardware") {
                  let discounttext3 = "";
                  if (x.discount > 0) {
                    discounttext3 =
                      (
                        x.productprice * x.quantity -
                        ((x.productprice * x.quantity) / 100) * x.discount
                      ).toFixed(2) +
                      " " +
                      this.currencycode +
                      " ( %" +
                      x.discount +
                      " " +
                      trans.discountraw +
                      " )";
                  }

                  altgrup +=
                    x.productname +
                    "<br>" +
                    " ( " +
                    x.quantity +
                    " " +
                    trans.quantity +
                    " X " +
                    x.productprice +
                    " " +
                    this.currencycode +
                    " " +
                    " = " +
                    x.productprice * x.quantity +
                    " " +
                    this.currencycode +
                    " )" +
                    "<br><b><span>" +
                    discounttext3 +
                    "</span></b><hr>";
                }
              });

              let fixprice = element.roomprice[0].fixprice;
              let fixstring = "";
              if (fixprice > 0) {
                fixstring =
                  element.firstprice[0].desc +
                  fixprice +
                  " " +
                  this.currencycode +
                  " ";
              }

              let hardwareitemtotal = 0;
              element.productgrup.forEach((x) => {
                if (x.type == "hardware" && x.selected == true) {
                  hardwareitemtotal +=
                    x.productprice * x.quantity -
                    ((x.productprice * x.quantity) / 100) * x.discount;
                }
              });

              if (hardwareitemtotal == undefined) {
                hardwareitemtotal = 0;
              } else {
                hardwareitemtotal = hardwareitemtotal;
              }

              let discounttext;
              if (element.discount > 0) {
                let nodiscountt =
                  element.total -
                  hardwareitemtotal +
                  ((element.total - hardwareitemtotal) /
                    (100 - element.discount)) *
                    element.discount;
                if (isFinite(nodiscountt) == false) {
                  nodiscountt = 0;
                }
                discounttext =
                  "(" +
                  trans.discountraw +
                  " %" +
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

              let product = "";
              if (element.singleproduct == true) {
                product =
                  "( " +
                  element.quantity +
                  " " +
                  trans.quantity +
                  " * " +
                  element.price +
                  " " +
                  this.currencycode +
                  " ) " +
                  this.decimalPipe.transform(element.quantity * element.price) +
                  " " +
                  this.currencycode +
                  "";
              }

              let pricetext = "";
              if (element.timesequence == "yearly") {
                pricetext =
                  "<b>" +
                  this.decimalPipe.transform(
                    element.total - hardwareitemtotal
                  ) +
                  "</b>" +
                  " " +
                  this.currencycode +
                  "";
                fixlytotal += element.total;
              }

              if (element.timesequence == "yearlyfix") {
                pricetext =
                  "<b>" +
                  this.decimalPipe.transform(
                    element.total - hardwareitemtotal
                  ) +
                  " " +
                  this.currencycode +
                  " " +
                  "</b>";
                fixlytotal += element.total;
              }

              if (element.timesequence == "yearlyfixsingle") {
                pricetext =
                  "<b>" +
                  this.decimalPipe.transform(
                    element.total - hardwareitemtotal
                  ) +
                  " " +
                  this.currencycode +
                  " " +
                  "</b>";
                fixlytotal += element.total;
              }

              html +=
                '<tr><td style="width:50%;">' +
                element.productname  +
                "<p>"+
                product +
                "<br>" +
                altgrup +
                "</p>" +
                "</td>" +
                '<td style="text-align: right;">' +
                element.roomprice[0].fixprice +" " +  this.currencycode  +
                "</td><td>" + element.count + 
                '</td><td style="text-align: right;"><p style=text-align: right; padding: 0; margin: 0;>' +
                discounttext +
                pricetext +
                "</td></tr>";
            }
          }
        });

        if (hardware) {
          html +=
            "<tr><td><strong>" +
            trans.hardwares +
            ":</strong><p>" +
            hardware +
            "</p></td><td></td>" +
            '<td style="text-align: right;"><strong>' +
            this.decimalPipe.transform(this.hardwaretotal) +
            " " +
            this.currencycode +
            " " +
            "</strong></td></tr>";
        }
        if (ekhizmetler) {
          html +=
            "<tr><td><strong>" +
            trans.additionalservices +
            ":</strong><p>" +
            ekhizmetler +
            "</p></td><td></td>" +
            '<td style="text-align: right;"><strong>' +
            this.decimalPipe.transform(this.firstprice) +
            " " +
            this.currencycode +
            " " +
            "</strong></td></tr>";
        }
        if (setupprice) {
          html +=
            "<tr><td><strong>" +
            trans.setupprices +
            ":</strong><p>" +
            setupprice +
            "</p></td><td></td>" +
            '<td style="text-align: right;"><strong>' +
            this.decimalPipe.transform(this.setuppricetotal) +
            " " +
            this.currencycode +
            " " +
            "</strong></td></tr>";
        }

        if (
          checkdatafix.length > 0 ||
          this.ekhizmetler.length > 0 ||
          this.hardware.length > 0 ||
          this.setupprice.length > 0
        ) {
          html +=
            "<tr><td><strong>" +
            trans.total +
            ":</strong></td><td></td><td></td>" +
            '<td class="totals" ><strong>' +
            this.decimalPipe.transform(
              fixlytotal +
                this.setuppricetotal +
                this.firstprice +
                this.hardwaretotal
            ) +
            " " +
            this.currencycode +
            " " +
            "</strong></td></tr>";
          html += "</tbody></table>";
        }

        html +=
          '<table class="w100"><thead><tr class="tableHead"><th class="coltab1"></th><th class="coltab2"></th><th class="coltab3"></th></tr></thead><tbody>';

        /*   if (this.yearlyfixpricetotal > 0) {
            html += '<tr><td><strong>' + trans.totalfeespayable + ':</strong></td><td>---</td>' + '<td class="totals" ><strong>' + this.decimalPipe.transform(monthlytotal) + " " + this.currencycode + "</td></tr>";
          } */

        let totalpacket = fixlytotal +this.firstprice +this.setuppricetotal +monthlytotal +this.hardwaretotal;
        html +=
          "<tr><td><strong>" +
          trans.grandtotal +
          ":</strong></td><td>---</td>" +
          '<td class="totals"><strong>' +
          this.decimalPipe.transform(
            (totalpacket * (1 + 18/100) )
          ) +
          " " +
          this.currencycode +
          "";
        " ( " +
          this.decimalPipe.transform(
            fixlytotal + this.firstprice + this.setuppricetotal
          ) +
          " " +
          this.currencycode +
          "" +
          " + " +
          this.decimalPipe.transform(monthlytotal) +
          " " +
          this.currencycode +
          " )" +
          "</strong></td></tr>";

        html += "</tbody></table>";

        let efatura = "";
        this.dataSource.forEach((e) => {
          if (e.selected) {
            if (e.firstprice[0].grupid == 6) {
              efatura = "<br>" + trans.efaturadesc;
            }
          }
        });

        html += efatura;

        let messagebody = html;
        t.append("offer", messagebody);
        if (this.profileForm.valid) {
          this.http
            .post(this.path + "teklifgonder.php", t, { responseType: "json" })
            .subscribe((resp: any) => {
              if (resp.html) {
                var sourceHTML = resp.html;
                console.log(sourceHTML);

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

                  if (formdata.roomcount > 50) {
                    this.close = true;
                  }
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
    let temproomCount = roomcount;
    if (roomcount <= this.CroomCount1) {
      this.dataSource = this.dataSource.map((x) => {
        if (x.count > 0) {
          x.selected = true;
        } else {
          x.selected = false;
        }
        let gruptotal = 0;

        if (x.pass != true) {
          if (x.selected == true) {
            if (x.minroomstatus == true) {
              if (temproomCount < x.minroom) {
                roomcount = x.minroom;
              } else {
                roomcount = temproomCount;
              }
            } else {
              if (roomcount < this.Cminroomcount) {
                roomcount = this.Cminroomcount;
              }
            }

            x.productgrup.forEach((y) => {
              if (y.selected == true) {
                if (y.time == "monthly") {
                  gruptotal +=
                    (y.quantity * y.productprice -
                      ((y.quantity * y.productprice) / 100) * y.discount) *
                    12;
                } else {
                  gruptotal +=
                    y.quantity * y.productprice -
                    ((y.quantity * y.productprice) / 100) * y.discount;
                }
              }
            });
          }

          let fixtotal = 0;
          let totalsub = x.roomprice[0].priceCase1 * roomcount;

          if (roomcount <= 1 && x.fixuse == true) {
            fixtotal = x.roomprice[0].fixprice * x.count;
          } else {
            if (
              x.roomprice[0].fixprice < totalsub &&
              x.fixroompricecalculate == true
            ) {
              fixtotal = totalsub;
            } else {
              fixtotal = x.roomprice[0].fixprice * x.count;
            }
          }

          if (
            x.roomprice[0].fixprice < totalsub &&
            x.fixroompricecalculate == true
          ) {
            fixtotal = totalsub;
          } else {
            fixtotal = x.roomprice[0].fixprice * x.count;
          }

          let totalfin;
          if (x.fixuse == false) {
            if (x.singleproduct == true) {
              totalfin =
                x.price * x.quantity -
                ((x.price * x.quantity) / 100) * x.discount;
            } else {
              totalfin = (totalsub - (totalsub / 100) * x.discount) * 12;
            }
          } else {
            if (
              (x.timesequence == "yearlyfixsingle" ||
                x.timesequence == "yearly") &&
              x.fixroompricecalculate != true
            ) {
              totalfin = fixtotal - (fixtotal / 100) * x.discount + gruptotal;
            } else if (
              (x.timesequence == "yearlyfixsingle" ||
                x.timesequence == "yearly") &&
              x.fixroompricecalculate == true
            ) {
              if (
                x.roomprice[0].fixprice < totalsub &&
                x.fixroompricecalculate == true
              ) {
                fixtotal = totalsub;
              }

              totalfin = fixtotal - (fixtotal / 100) * x.discount + gruptotal;
            } else {
              totalfin =
                (fixtotal - (fixtotal / 100) * x.discount) * 12 + gruptotal;
            }
          }

          let userprice = 0;
          if (x.hasOwnProperty("userbarems") && x.userbarems) {
            if (x.userbarems.selected) {
              let selected = x.userbarems.selected;
              if (totalfin <= x.minprice) {
                totalfin = x.minprice;
              }
              userprice = totalfin * selected.userprice - totalfin;

              if (x.useramountmod == true) {
                userprice = totalfin + selected.userprice - totalfin;
              } else {
                userprice = totalfin * selected.userprice - totalfin;
              }
            }
          }

          if (totalfin < 0) {
            totalfin = 0;
          }

          let FinalTotal = 0;
          if (x.useramountmod == true) {
            FinalTotal = totalfin + userprice;
          } else {
            FinalTotal = totalfin + userprice;
          }

          if (FinalTotal < x.minprice && x.discount > 0) {
            FinalTotal = x.minprice - (x.minprice / 100) * x.discount;
            if (FinalTotal < 0) {
              FinalTotal = 0;
            }
          } else if (FinalTotal < x.minprice) {
            FinalTotal = x.minprice;
          }

          if (x.userpricecal == true && roomcount < this.Cminroomcount) {
            FinalTotal = totalfin + userprice;
          }

          return {
            fixuse: x.fixuse,
            id: x.id,
            productname: x.productname,
            productimg: x.productimg,
            roomprice: x.roomprice,
            productgrup: x.productgrup,
            gruptotal: gruptotal,
            total: FinalTotal,
            selected: x.selected,
            desc: x.desc,
            firstprice: x.firstprice,
            fixroompricecalculate: x.fixroompricecalculate,
            discount: x.discount,
            singleproduct: x.singleproduct,
            timesequence: x.timesequence,
            price: x.price,
            quantity: x.quantity,
            userpricecal: x.userpricecal,
            userlabel: x.userlabel,
            usercount: x.usercount,
            userlimit: x.userlimit,
            usermaxlimit: x.usermaxlimit,
            userbarems: x.userbarems,
            useramountmod: x.useramountmod,
            efatura: x.efatura,
            maxprice: x.maxprice,
            minroom: x.minroom,
            maxroom: x.maxroom,
            minroomstatus: x.minroomstatus,
            producttip: x.producttip,
            defaultmaxroom: x.defaultmaxroom,
            minprice: x.minprice,
            count: x.count,
          };
        } else {
          return {
            head: x.head,
            pass: x.pass,
          };
        }
      });
    }
  }

  showControl() {
    if (this.profileForm.valid) {
      if (this.dataSource.filter((x) => x.selected == true).length > 0) {
        this.showpriceControl = false;
      }
    }
  }

  total(roomcount) {
    this.totalfunction();
  }

  totalfunction() {
    let totalprice = 0;
    let singleprice = 0;
    let grupid = 0;

    let grupid1 = 0;
    let ekhizmetler = new Array();
    let hardware = new Array();
    let setupprice = new Array();

    this.dataSource.forEach((element) => {
      if (element.pass != true) {
        if (element.selected == true) {
          if (element.firstprice[0].grupid != grupid1) {
            ekhizmetler.push(element);
            grupid1 = element.firstprice[0].grupid;
          }
        }
      }
    });
    this.ekhizmetler = [];

    this.dataSource.forEach((element) => {
      if (element.pass != true) {
        if (element.selected == true) {
          element.productgrup.forEach((element2) => {
            if (element2.type == "hardware" && element2.selected == true) {
              hardware.push(element2);
            }
          });
        }
      }
    });

    this.hardware = hardware;
    let hardwaretotal = 0;

    hardware.forEach((element) => {
      hardwaretotal +=
        element.productprice * element.quantity -
        ((element.productprice * element.quantity) / 100) * element.discount;
    });

    this.dataSource.forEach((element) => {
      if (element.pass != true) {
        element.productgrup.forEach((x) => {
          if (x.selected == true && x.type != "hardware") {
            if (
              x.setupprice > 0 &&
              x.quantitycross == true &&
              x.selected == true
            ) {
              setupprice.push(x);
            }
          }
        });
      }
    });

    this.setupprice = setupprice;

    let setuppicetotal = 0;
    this.setupprice.forEach((y) => {
      setuppicetotal += y.quantity * y.setupprice;
    });

    this.setuppricetotal = setuppicetotal;

    this.dataSource.forEach((element) => {
      if (element.pass != true) {
        if (element.selected == true) {
          if (element.firstprice[0].grupid != grupid) {
            singleprice += element.firstprice[0].price;
            grupid = element.firstprice[0].grupid;
          }
          totalprice += element.total;
        }
      }
    });

    let yearlyfixpricetotal = 0;
    this.dataSource.forEach((element) => {
      if (element.pass != true) {
        if (element.selected == true && element.timesequence == "yearlyfix") {
          yearlyfixpricetotal += element.total;
        }
      }
    });

    let yearlyfixsinglepricetotal = 0;
    this.dataSource.forEach((element) => {
      if (element.pass != true) {
        if (
          element.selected == true &&
          element.timesequence == "yearlyfixsingle"
        ) {
          yearlyfixsinglepricetotal += element.total;
        }
      }
    });

    this.totalpricefinal = totalprice;
    this.hardwaretotal = hardwaretotal;
    this.firstprice = singleprice;
    this.yearlyfixpricetotal = yearlyfixpricetotal;
    this.yearlyfixsinglepricetotal = yearlyfixsinglepricetotal;
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
          element.discount = parseInt(data.target.value);
        });
    } else {
      alert(
        "Önce ürünlerinizi seçmelisiniz. Ürün seçiminden sonra topla indirim uygulayabilirsiniz"
      );
      data.target.value = 0;
    }
  }
}
