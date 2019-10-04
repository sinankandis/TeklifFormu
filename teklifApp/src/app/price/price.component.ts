
import { Component, OnInit, ɵConsole, ViewContainerRef, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { UserService } from '../admin/User.service';
import { element } from 'protractor';
import { group } from '@angular/animations';
import { zip } from 'rxjs';




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
  selector: 'app-price',
  templateUrl: './price.component.html',
  styleUrls: ['./price.component.css']
})
export class PriceComponent implements OnInit {
  @ViewChild('progressTpl', { read: TemplateRef, static: true }) progressTpl: TemplateRef<any>;
  constructor(
    private http: HttpClient,
    public overlay: Overlay,
    public viewContainerRef: ViewContainerRef,
    public dialog: MatDialog,
    private decimalPipe: DecimalPipe,
    public userservice: UserService) { }





  profileForm = new FormGroup({


    hotelname: new FormControl('', Validators.required),
    roomcount: new FormControl('', [Validators.required, Validators.min(0)]),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    authorized: new FormControl('', Validators.required),
    wantname: new FormControl(''),
    wantemail: new FormControl(''),
    wantphone: new FormControl(''),
    sellerEmailCheck: new FormControl(true)



  });

  public dataSource: any;
  path: string = "http://localhost/teklif/";
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


  elementdata: PeriodicElement[] = [];


  openDialog() {
    // const dialogConfig = new MatDialogConfig();
    //dialogConfig.width ="30%";
    //this.dialog.open(DialogComponent,dialogConfig)
  }


  ngOnInit() {

    if (this.userservice.userdata != null) {
      this.profileForm.get("wantphone").setValue(this.userservice.userdata[0].tel);
      this.profileForm.get("wantemail").setValue(this.userservice.userdata[0].email);
      this.profileForm.get("wantname").setValue(this.userservice.userdata[0].name);

    }







    this.http.get(this.path + "pricelist.php").subscribe(resp => {
      this.dataSource = this.elementdata = resp as any;
      console.log(this.dataSource);
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
      positionStrategy: this.overlay.position().global().centerHorizontally().centerVertically()
    });
    this.overlayRef.attach(new TemplatePortal(this.progressTpl, this.viewContainerRef));
  }

  detachOverlay() {
    if (this.overlayRef) {
      this.overlayRef.detach();
    }
  }



  teklifGonder(process) {


    if (this.profileForm.valid) {
      if (this.dataSource.filter(x => x.selected == true).length <= 0) {
        alert("Teklif Oluşturmak İçin En Az Bir Ürün Seçiniz!")
      }
      else {
        this.progress();
        let t = new FormData();
        let formdata = this.profileForm.value;
        t.append('process', process);
        t.append('hotelname', formdata.hotelname);
        t.append('email', formdata.email);
        t.append('phone', formdata.phone);
        t.append('authorized', formdata.authorized);
        t.append('wantname', formdata.wantname);
        t.append('roomcount', formdata.roomcount);
        t.append('offerstate', 'Teklif Gönderildi.');
        t.append('wantemail', formdata.wantemail);
        t.append('wantphone', formdata.wantphone);
        t.append('sellerEmailCheck', formdata.sellerEmailCheck);
        let html ="";
        let checkdata = this.dataSource.filter(x=> x=> x.selected && !(x.timesequence == "yearlyfix" || x.timesequence == "yearlyfixsingle" || x.timesequence == "yearly") );
        if(checkdata.length >0) {
          html += '<table class="w100"><thead><tr class="tableHead"><th class="coltab1">Yazılım Ürünleri/Açıklama</th><th class="coltab2">Oda Sayısı</th><th class="coltab3">T.Fiyat (€)</th></tr></thead><tbody>';
          }
        let total = 0;
        let monthlytotal = 0;
        this.dataSource.forEach(element => {

          if (element.selected) {
            if (!(element.timesequence == "yearlyfix" || element.timesequence == "yearlyfixsingle" || element.timesequence == "yearly")) {
              let altgrup = "";
              element.productgrup.forEach(x => {
                if (x.selected == true && x.type != "hardware") {
                  let discounttext3 = "";
                  if (x.discount > 0) {
                    discounttext3 = ((x.productprice * x.quantity) - (((x.productprice * x.quantity) / 100) * x.discount)).toFixed(2) + " € ( %" + x.discount + " İndirim )"
                  }
                  altgrup += x.productname + "<br>" + ' ( ' + x.quantity + ' Adet X ' + x.productprice + ' € ' + ' = ' + (x.productprice * x.quantity) + ' € )' + '<br><b><span>' + discounttext3 + "</span></b><hr>";
                }
              });



              let fixprice = element.roomprice[0].fixprice;
              let fixstring = "";
              if (fixprice > 0) {
                fixstring = element.firstprice[0].desc + fixprice + ' € ';
              }

     
              let discounttext;
              if (element.discount > 0) {
                let nodiscountt = (element.total) + ((element.total ) / (100 - element.discount) * element.discount);
                discounttext = "( İndirim %" + element.discount + " ) " + '<span class="discountpricecss">' + this.decimalPipe.transform(nodiscountt.toFixed(2)) + ' €</span>' + "<br>";
              } else { discounttext = ""; }

              let product = "";
              if (element.singleproduct == true) {
                product = "( " + element.quantity + " Adet * " + element.price + " € ) " + this.decimalPipe.transform(element.quantity * element.price) + " €"

              }

              monthlytotal += element.total;
              let pricetext = "";
              if (element.timesequence == "yearly") {
                pricetext = "<b>" + this.decimalPipe.transform(element.total) + "</b>" + " €/yıl ";

              }

              if (element.timesequence == "yearlyfix") {
                pricetext = "<b>" + this.decimalPipe.transform(element.total) + "</b>" + " €/ilkyıl ";

              }


              if (element.timesequence == "yearlyfixsingle") {
                pricetext = "<b>" + this.decimalPipe.transform(element.total) + "</b>" + " €/ilkyıl ";
              }

              else { pricetext = "<b>" + this.decimalPipe.transform((element.total /12)) + "</b>" + " €/ay -- " + this.decimalPipe.transform(element.total) + " €/yıl" }



              html += '<tr><td style="width:50%;"><strong>' + element.productname + '</strong><p>' + element.desc + "<br>" + product + '<p>' +
                '<p>'  /*fixstring*/ + '<br>' + altgrup + '</p>'
                + '</td>' +
                '<td>' + formdata.roomcount + '</td>' +
                '<td style="text-align: right;"><p style=text-align: right; padding: 0; margin: 0;>' + discounttext + pricetext + '</p></tr>';
            }

          }

        });

        if(checkdata.length >0) {
        html += '<tr><td><strong>Yıllık Toplam :</strong></td><td></td>' + '<td style="text-align: right;"><strong>' +" €" + this.decimalPipe.transform(monthlytotal) +  '</strong></td></tr>';
        html += '</tbody></table><br><br>';
         }

         let checkdatafix = this.dataSource.filter(x=> x.selected && (x.timesequence == "yearlyfix" || x.timesequence == "yearlyfixsingle" || x.timesequence == "yearly") );
         if(checkdatafix.length >0) {
          html += '<div class="heading">İlk Yıl Ücretlendirelecek Ürünler ve Hizmetler</div>';
          html += '<table class="w100"><thead><tr class="tableHead"><th class="coltab1">Yazılım Ürünleri/Açıklama</th><th class="coltab2">Oda Sayısı</th><th class="coltab3">T.Fiyat (€)</th></tr></thead><tbody>';
  
          }

        /* Tek Seferlik ve Sabit Ücterler Toplamı */
        let fixlytotal = 0;
        this.dataSource.forEach(element => {
          if (element.selected) {
            if ((element.timesequence == "yearlyfix" || element.timesequence == "yearlyfixsingle" || element.timesequence == "yearly")) {
              let altgrup = "";
              element.productgrup.forEach(x => {
                if (x.selected == true && x.type != "hardware") {
                  let discounttext3 = "";
                  if (x.discount > 0) {
                    discounttext3 = ((x.productprice * x.quantity) - (((x.productprice * x.quantity) / 100) * x.discount)).toFixed(2) + " € ( %" + x.discount + " İndirim )"
                  }

                  altgrup += x.productname + "<br>" + ' ( ' + x.quantity + ' Adet X ' + x.productprice + ' € ' + ' = ' + (x.productprice * x.quantity) + ' € )' + '<br><b><span>' + discounttext3 + "</span></b><hr>";
                }
              });



              let fixprice = element.roomprice[0].fixprice;
              let fixstring = "";
              if (fixprice > 0) {
                fixstring = element.firstprice[0].desc + fixprice + ' € ';
              }

              let hardwareitemtotal = 0;
              element.productgrup.forEach(x => {
                if (x.type == "hardware" && x.selected == true) { hardwareitemtotal += (x.productprice * x.quantity) - (((x.productprice * x.quantity) / 100) * x.discount) }

              });

              if (hardwareitemtotal == undefined) { hardwareitemtotal = 0; } else { hardwareitemtotal = hardwareitemtotal }

              let discounttext;
              if (element.discount > 0) {
                let nodiscountt = (element.total - hardwareitemtotal) + ((element.total - hardwareitemtotal) / (100 - element.discount) * element.discount);
                discounttext = "( İndirim %" + element.discount + " ) "+ '<span class="discountpricecss">' + this.decimalPipe.transform(nodiscountt.toFixed(2)) + ' €</span>' + "<br>";
              } else { discounttext = ""; }

              let product = "";
              if (element.singleproduct == true) {
                product = "( " + element.quantity + " Adet * " + element.price + " € ) " + this.decimalPipe.transform(element.quantity * element.price) + " €"

              }



              let pricetext = "";
              if (element.timesequence == "yearly") {
                pricetext = "<b>" + this.decimalPipe.transform(element.total - hardwareitemtotal) + "</b>" + " € ";
                fixlytotal += element.total;
              }

              if (element.timesequence == "yearlyfix") {
                pricetext = "<b>" + this.decimalPipe.transform(element.total - hardwareitemtotal) + " € " + "</b>";
                fixlytotal += element.total;              }


              if (element.timesequence == "yearlyfixsingle") {
                pricetext = "<b>" + this.decimalPipe.transform(element.total - hardwareitemtotal) + " € " + "</b>";
                fixlytotal += element.total;
              }





              html += '<tr><td style="width:50%;"><strong>' + element.productname + '</strong><p>' + element.desc + "<br>" + product + '<p>' +
                '<p>'  /*fixstring*/ + '<br>' + altgrup + '</p>'
                + '</td>' +
                '<td>' + formdata.roomcount + '</td>' +
                '<td style="text-align: right;"><p style=text-align: right; padding: 0; margin: 0;>' + discounttext + pricetext + '</p></tr>';
            }

          }

        });


        let ekhizmetler = "";
        this.ekhizmetler.forEach(x => {
          if (x.selected == true && x.firstprice[0].price > 0) {
            ekhizmetler += 'Hizmet : ' + x.firstprice[0].desc + '  ' + this.decimalPipe.transform(x.firstprice[0].price) + ' €' + '<br>';
          }
        });

        let hardware = "";
        this.hardware.forEach(x => {
          let discounttext2 = "";
          if (x.discount > 0) {
            discounttext2 = "<b>" + this.decimalPipe.transform(((x.productprice * x.quantity) - (((x.productprice * x.quantity) / 100) * x.discount)).toFixed(2)) + " € ( %" + x.discount + " İndirim )</b>"
          }
          hardware += x.productname + "<br>" + ' ( ' + x.quantity + ' Adet X ' + this.decimalPipe.transform(x.productprice) + ' € ' + ' = ' + this.decimalPipe.transform((x.productprice * x.quantity)) + ' € )' + "<br><span>" +
            discounttext2
            + "</span><hr><br>";

        })

        let setupprice = "";
        this.setupprice.forEach(x => {
          setupprice += x.setupdesc + "<br>" + "( " + x.quantity + " * " + this.decimalPipe.transform(x.setupprice) + " € )" + this.decimalPipe.transform(x.quantity * x.setupprice) + " €";
        });

        if (hardware) {
          html += '<tr><td><strong>Donanımlar :</strong><p>' + hardware + '</p></td><td></td>' + '<td style="text-align: right;"><strong>' + this.decimalPipe.transform(this.hardwaretotal) + ' € ' + '</strong></td></tr>';
        }
        if (ekhizmetler) {
          html += '<tr><td><strong>Ek Hizmetler :</strong><p>' + ekhizmetler + '</p></td><td></td>' + '<td style="text-align: right;"><strong>' + this.decimalPipe.transform(this.firstprice) + ' € ' + '</strong></td></tr>';
        }
        if (setupprice) {
          html += '<tr><td><strong>Kurulum Ücretleri :</strong><p>' + setupprice + '</p></td><td></td>' + '<td style="text-align: right;"><strong>' + this.decimalPipe.transform(this.setuppricetotal) + ' € ' + '</strong></td></tr>';
        }


        if(checkdatafix.length >0) {
        html += '<tr><td><strong>Toplam :</strong></td><td></td>' + '<td class="totals" ><strong>' + this.decimalPipe.transform((fixlytotal + this.setuppricetotal + this.firstprice)) + " € " + '</strong></td></tr>';
        html += '</tbody></table>';
        }

    
        html += '<table class="w100"><thead><tr class="tableHead"><th class="coltab1"></th><th class="coltab2"></th><th class="coltab3"></th></tr></thead><tbody>';

        if (this.yearlyfixpricetotal > 0) {
          html += '<tr><td><strong>Devam Eden Yıllarda Ödenecek Ücretler Toplamı :</strong></td><td>---</td>' + '<td class="totals" ><strong>' + this.decimalPipe.transform(monthlytotal)  + " € "+ '</td></tr>';
        }
        html += '<tr><td><strong>Genel Toplam :</strong></td><td>---</td>' + '<td class="totals"><strong>' +  this.decimalPipe.transform((fixlytotal + this.firstprice + this.setuppricetotal + monthlytotal) )  + " €"
          " ( " + this.decimalPipe.transform((fixlytotal  + this.firstprice + this.setuppricetotal))  + " €" +
          " + "+ this.decimalPipe.transform((monthlytotal)) + " € )" +
          '</strong></td></tr>';
          html +="</tbody></table>";
      

        let messagebody = html;
        t.append('offer', messagebody);
        if (this.profileForm.valid) {
          this.http.post(this.path + "teklifgonder.php", t, { responseType: 'json' }
          ).subscribe((resp: any) => {
            if (resp.html) {

              var sourceHTML = resp.html

              var source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
              var fileDownload = document.createElement("a");
              document.body.appendChild(fileDownload);
              fileDownload.href = source;
              fileDownload.download = 'teklif.doc';
              fileDownload.click();
              document.body.removeChild(fileDownload);
              this.detachOverlay();



            } else {

              if (resp.success) {
                alert("Teklifiniz Gönderildi.Teklif Detayları e-posta ile iletilmiştir.");
                this.detachOverlay();
              }
            }
          });
        }




      }
    } else { alert("Lütfen Tüm Alanları Doldurunuz") }
  }



  changeData(roomcount) {



    if (roomcount <= 100) {
      if (roomcount < 10) { roomcount = 10 }
      this.dataSource = this.dataSource.map(x => {
        let gruptotal = 0;
        if (x.selected == true) {
          x.productgrup.forEach(y => {
            if (y.selected == true) {
              if(y.time=="monthly") {
              gruptotal += ((y.quantity * y.productprice) - (((y.quantity * y.productprice) / 100) * y.discount))*12;
            } else {  gruptotal += (y.quantity * y.productprice) - (((y.quantity * y.productprice) / 100) * y.discount);
            }
            }
          });
        }

        let fixtotal = 0;

        if (roomcount <= 1 && x.fixuse == true) {
          fixtotal = x.roomprice[0].fixprice;
        } else {

          if (x.roomprice[0].fixprice < (roomcount * x.roomprice[0].priceCase1) && x.fixroompricecalculate == true) {
            fixtotal = (roomcount * x.roomprice[0].priceCase1);
          } else {
            fixtotal = x.roomprice[0].fixprice;
          }
        }




        if (x.roomprice[0].fixprice < (roomcount * x.roomprice[0].priceCase1) && x.fixroompricecalculate == true) {
            fixtotal = (roomcount * x.roomprice[0].priceCase1);
        } 
        else {
               fixtotal = x.roomprice[0].fixprice;
             }

        let totalsub = x.roomprice[0].priceCase1 * roomcount;
        let totalfin;
        if (x.fixuse == false) {
          if (x.singleproduct == true) {
            totalfin = (x.price * x.quantity) - (((x.price * x.quantity) / 100) * x.discount)
          } else {
            totalfin = (totalsub - ((totalsub / 100) * x.discount) ) *12;
          }
        } else {
          if(x.timesequence == "yearlyfixsingle" || x.timesequence == "yearly") {
          totalfin = (fixtotal - ((fixtotal / 100) * x.discount)) + gruptotal
          } else {
            totalfin = ((fixtotal - ((fixtotal / 100) * x.discount)) *12) + gruptotal
          }
        }


        return {
          'fixuse': x.fixuse,
          'id': x.id,
          'productname': x.productname,
          'roomprice': x.roomprice,
          'productgrup': x.productgrup,
          'gruptotal': gruptotal,
          'total': totalfin,
          'selected': x.selected,
          'desc': x.desc,
          'firstprice': x.firstprice,
          'fixroompricecalculate': x.fixroompricecalculate,
          'discount': x.discount,
          "singleproduct": x.singleproduct,
          "timesequence": x.timesequence,
          "price": x.price,
          "quantity": x.quantity

        };
      }
      );
    }


    if (roomcount >= 101 && roomcount <= 200) {
      this.dataSource = this.dataSource.map(x => {
        let gruptotal = 0;
        if (x.selected == true) {
          x.productgrup.forEach(y => {
            if (y.selected == true) {
              if(y.time=="monthly") {
              gruptotal += ((y.quantity * y.productprice) - (((y.quantity * y.productprice) / 100) * y.discount))*12;
            } else {  gruptotal += (y.quantity * y.productprice) - (((y.quantity * y.productprice) / 100) * y.discount);
            }
            }
          });
        }


        let fixtotal = 0;

        if (roomcount <= 1 && x.fixuse == true) {
          fixtotal = x.roomprice[0].fixprice;
        } else {
          if (x.roomprice[0].fixprice < (100 * x.roomprice[0].priceCase1) + ((roomcount - 100) * x.roomprice[0].priceCase2) && x.fixroompricecalculate == true) {
            fixtotal = (100 * x.roomprice[0].priceCase1) + ((roomcount - 100) * x.roomprice[0].priceCase2);
          } else {
            fixtotal = x.roomprice[0].fixprice;
          }
        }



        if (x.roomprice[0].fixprice < ((100 * x.roomprice[0].priceCase1) + ((roomcount - 100) * x.roomprice[0].priceCase2)) && x.fixroompricecalculate == true) {
          fixtotal = (100 * x.roomprice[0].priceCase1) + ((roomcount - 100) * x.roomprice[0].priceCase2);
        } else {
          fixtotal = x.roomprice[0].fixprice;
        }
        let totalsub = x.roomprice[0].priceCase1 * 100 + x.roomprice[0].priceCase2 * (roomcount - 100);
        let totalfin;
        if (x.fixuse == false) {
          if (x.singleproduct == true) {
            totalfin = (x.price * x.quantity) - (((x.price * x.quantity) / 100) * x.discount)
          } else {
            totalfin = (totalsub - ((totalsub / 100) * x.discount) ) *12;
          }
        } else {
          if(x.timesequence == "yearlyfixsingle" || x.timesequence == "yearly") {
          totalfin = (fixtotal - ((fixtotal / 100) * x.discount)) + gruptotal
          } else {
            totalfin = ((fixtotal - ((fixtotal / 100) * x.discount)) *12) + gruptotal
          }
        }



        return {
          'fixuse': x.fixuse,
          'id': x.id,
          'productname': x.productname,
          'roomprice': x.roomprice,
          'productgrup': x.productgrup,
          'gruptotal': gruptotal,
          'total': totalfin,
          'selected': x.selected,
          'desc': x.desc,
          'firstprice': x.firstprice,
          'fixroompricecalculate': x.fixroompricecalculate,
          'discount': x.discount,
          "singleproduct": x.singleproduct,
          "timesequence": x.timesequence,
          "price": x.price,
          "quantity": x.quantity
        };
      }
      );

    }



    if (roomcount > 200) {

      this.dataSource = this.dataSource.map(x => {
        let gruptotal = 0;
        if (x.selected == true) {
          x.productgrup.forEach(y => {
            if (y.selected == true) {
              if(y.time=="monthly") {
              gruptotal += ((y.quantity * y.productprice) - (((y.quantity * y.productprice) / 100) * y.discount))*12;
            } else {  gruptotal += (y.quantity * y.productprice) - (((y.quantity * y.productprice) / 100) * y.discount);
            }
            }
          });
        }

        let fixtotal = 0;
        if (roomcount <= 1 && x.fixuse == true) {
          fixtotal = x.roomprice[0].fixprice;
        } else {
          if (x.roomprice[0].fixprice < (100 * x.roomprice[0].priceCase1) + ((roomcount - 100) * x.roomprice[0].priceCase2) + ((roomcount - 200) * x.roomprice[0].priceCase3) && x.fixroompricecalculate == true) {
            fixtotal = (100 * x.roomprice[0].priceCase1) + ((roomcount - 100) * x.roomprice[0].priceCase2) + ((roomcount - 200) * x.roomprice[0].priceCase3);
          } else {
            fixtotal = x.roomprice[0].fixprice;
          }
        }




        let totalsub = x.roomprice[0].priceCase1 * 100 + x.roomprice[0].priceCase2 * 100 + x.roomprice[0].priceCase3 * (roomcount - 200);
        let totalfin;
        if (x.fixuse == false) {
          if (x.singleproduct == true) {
            totalfin = (x.price * x.quantity) - (((x.price * x.quantity) / 100) * x.discount)
          } else {
            totalfin = (totalsub - ((totalsub / 100) * x.discount) ) *12;
          }
        } else {
          if(x.timesequence == "yearlyfixsingle" || x.timesequence == "yearly") {
          totalfin = (fixtotal - ((fixtotal / 100) * x.discount)) + gruptotal
          } else {
            totalfin = ((fixtotal - ((fixtotal / 100) * x.discount)) *12) + gruptotal
          }
        }

        return {
          'fixuse': x.fixuse,
          'id': x.id,
          'productname': x.productname,
          'roomprice': x.roomprice,
          'productgrup': x.productgrup,
          'gruptotal': gruptotal,
          'total': totalfin,
          'selected': x.selected,
          'desc': x.desc,
          'firstprice': x.firstprice,
          'fixroompricecalculate': x.fixroompricecalculate,
          'discount': x.discount,
          "singleproduct": x.singleproduct,
          "timesequence": x.timesequence,
          "price": x.price,
          "quantity": x.quantity



        };
      }
      );

    }
  }


  showControl() {
    if (this.profileForm.valid) {
      if (this.dataSource.filter(x => x.selected == true).length > 0) {
        this.showpriceControl = false;
      }
    }
  }



  total(roomcount) {

    if (this.profileForm.valid && this.showpriceControl == false) {
      let totalprice = 0;
      let singleprice = 0;
      let grupid = 0;

      let grupid1 = 0;
      let ekhizmetler = new Array();
      let hardware = new Array();
      let setupprice = new Array();

      this.dataSource.forEach(element => {

        if (element.selected == true) {

          if (element.firstprice[0].grupid != grupid1) {
            ekhizmetler.push(element);
            grupid1 = element.firstprice[0].grupid;
          }
        }
      });
      this.ekhizmetler = ekhizmetler;






      this.dataSource.forEach(element => {
        if (element.selected == true) {
          element.productgrup.forEach(element2 => {
            if (element2.type == "hardware" && element2.selected == true) {
              hardware.push(element2);
            }

          });

        }
      });



      this.hardware = hardware;
      let hardwaretotal = 0;

      hardware.forEach(element => {

        hardwaretotal += (element.productprice * element.quantity) - (((element.productprice * element.quantity) / 100) * element.discount);

      });



      this.dataSource.forEach(element => {
        element.productgrup.forEach(x => {
          if (x.selected == true && x.type != "hardware") {
            if (x.setupprice > 0 && x.quantitycross == true && x.selected == true) {
              setupprice.push(x);
            }

          }
        })
      });

      this.setupprice = setupprice;

      let setuppicetotal = 0;
      this.setupprice.forEach(y => {
        setuppicetotal += (y.quantity * y.setupprice)

      });

      this.setuppricetotal = setuppicetotal;




      this.dataSource.forEach(element => {
        if (element.selected == true) {

          if (element.firstprice[0].grupid != grupid) {
            singleprice += element.firstprice[0].price;
            grupid = element.firstprice[0].grupid;
          }
          totalprice += element.total;

        }

      });


      let yearlyfixpricetotal = 0;
      this.dataSource.forEach(element => {
        if (element.selected == true && element.timesequence == "yearlyfix") {
          yearlyfixpricetotal += element.total;
        }

      });


      let yearlyfixsinglepricetotal = 0;
      this.dataSource.forEach(element => {
        if (element.selected == true && element.timesequence == "yearlyfixsingle") {
          yearlyfixsinglepricetotal += element.total
        }

      });



      this.totalpricefinal = totalprice;
      this.hardwaretotal = hardwaretotal;
      this.firstprice = singleprice;
      this.yearlyfixpricetotal = yearlyfixpricetotal;
      this.yearlyfixsinglepricetotal = yearlyfixsinglepricetotal



    } else { this.totalpricefinal = 0; this.hardwaretotal = 0; }

  }






}











