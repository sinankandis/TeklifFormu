
import { Component, OnInit, ɵConsole, ViewContainerRef, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CurrencyPipe, DecimalPipe } from '@angular/common';




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
    private decimalPipe: DecimalPipe) { }


  profileForm = new FormGroup({
    hotelname: new FormControl('', Validators.required),
    roomcount: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    authorized: new FormControl('', Validators.required),
    wantname: new FormControl(''),
    wantemail: new FormControl(''),
    wantphone: new FormControl(''),
    sellerEmailCheck: new FormControl(true)



  });

  public dataSource: any;
  roomCount: number = 0;
  alertmessage: string;
  offer: boolean = false;
  totalpricefinal: number;
  firstprice: number = 0;
  showpriceControl: boolean = true;
  overlayRef: OverlayRef;
  ekhizmetler: any;


  elementdata: PeriodicElement[] = [];


  openDialog() {
    // const dialogConfig = new MatDialogConfig();
    //dialogConfig.width ="30%";
    //this.dialog.open(DialogComponent,dialogConfig)
  }


  ngOnInit() {

    this.http.get("http://localhost/teklif/pricelist.php").subscribe(resp => {
      this.dataSource = this.elementdata = resp as any;
      console.log(this.dataSource);
    });
    this.total(0);

  }

  log() {
    console.log(this.profileForm.value.sellerEmailCheck);

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



  teklifGonder() {


    if (this.profileForm.valid) {
      if (this.dataSource.filter(x => x.selected == true).length <= 0) {
        alert("Teklif Oluşturmak İçin En Az Bir Ürün Seçiniz!")
      }
      else {


        this.progress();
        let t = new FormData();
        let formdata = this.profileForm.value;
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

        let html = '';
        let total = 0;
        this.dataSource.forEach(element => {

          if (element.selected) {
            let altgrup = "";
            element.productgrup.forEach(x => {
              if (x.selected == true) {
                altgrup += x.productname + ' ( ' + x.quantity + ' Adet X ' + x.productprice + ' € ' + ' = ' + (x.productprice * x.quantity) + ' € )' + '<br>';
              }
            });




            let fixprice = element.roomprice[0].fixprice;
            let fixstring = "";
            if (fixprice > 0) {
              fixstring = element.productname + ' Aylık Kullanım Fiyatı ' + fixprice + ' € ';
            }

            total += element.total;
            html += '<tr><td style="width:50%;"><strong>' + element.productname + '</strong><p>' + element.desc + '<p>' +
              '<p>' + fixstring + '<br>' + altgrup + '</p>'
              + '</td>' +
              '<td>' + formdata.roomcount + '</td>' +
              '<td style="text-align: right;"><p style=text-align: right; padding: 0; margin: 0;>' + element.total + " €/ay " + '</p></tr>';
          }
        });

        let ekhizmetler = "";
        this.ekhizmetler.forEach(x => {
          if (x.selected == true && x.firstprice[0].price > 0) {
            ekhizmetler += 'Hizmet : ' + x.firstprice[0].desc + '  ' + x.firstprice[0].price + ' €' + '<br>';
          }
        });

        html += '<tr><td><strong>Ek Hizmetler :</strong><p>' + ekhizmetler + '</p></td><td></td>' + '<td style="text-align: right;"><strong>' + this.firstprice + ' € ' + '</strong></td></tr>';
        html += '<tr><td><strong>Yıllık Toplam :</strong></td><td></td>' + '<td style="text-align: right;"><strong>' + this.decimalPipe.transform((total * 12)) + " € " + '</strong>(' + total + ' € * 12 )</td></tr>';
        html += '<tr><td><strong>Genel Toplam :</strong></td><td></td>' + '<td style="text-align: right;"><strong>' + this.decimalPipe.transform(((total * 12) + this.firstprice)) + " € " + '</strong></td></tr>';

        let messagebody = html;
        t.append('offer', messagebody);
        if (this.profileForm.valid) {
          this.http.post("http://localhost/teklif/teklifgonder.php", t
          ).subscribe(resp => { if (resp == "success") { alert("Teklifiniz Gönderildi."); } });
        }

        this.detachOverlay();
        alert("Teklifiniz Gönderildi.");

      }
    } else { alert("Lütfen Tüm Alanları Doldurunuz") }
  }



  changeData(roomcount) {


    let totalprice = 0;
    let totalprice1 = 0;
    let totalprice2 = 0;
    let totalprice3 = 0;

    if (roomcount <= 100) {

      if (roomcount < 10) { roomcount = 10 }

      this.dataSource = this.dataSource.map(x => {
        let gruptotal = 0;
        if (x.selected == true) {
          x.productgrup.forEach(y => {
            if (y.selected == true) {
              gruptotal += y.quantity * y.productprice;
            }
          });
        }

        return {

          'fixuse': x.fixuse,
          'id': x.id,
          'productname': x.productname,
          'roomprice': x.roomprice,
          'productgrup': x.productgrup,
          'gruptotal': gruptotal,
          'total': x.fixuse == false ? x.roomprice[0].priceCase1 * roomcount : x.roomprice[0].fixprice + gruptotal,
          'selected': x.selected,
          'desc': x.desc,
          'firstprice': x.firstprice
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
              gruptotal += y.quantity * y.productprice;
            }
          });
        }

        console.log(gruptotal);

        return {
          'fixuse': x.fixuse,
          'id': x.id,
          'productname': x.productname,
          'roomprice': x.roomprice,
          'productgrup': x.productgrup,
          'gruptotal': gruptotal,
          'total': x.fixuse == false ? x.roomprice[0].priceCase1 * 100 + x.roomprice[0].priceCase2 * (roomcount - 100) : x.roomprice[0].fixprice + gruptotal,
          'selected': x.selected,
          'desc': x.desc,
          'firstprice': x.firstprice
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
              gruptotal += y.quantity * y.productprice;
            }
          });
        }

        return {
          'fixuse': x.fixuse,
          'id': x.id,
          'productname': x.productname,
          'roomprice': x.roomprice,
          'productgrup': x.productgrup,
          'gruptotal': gruptotal,
          'total': x.fixuse == false ? x.roomprice[0].priceCase1 * 100 + x.roomprice[0].priceCase2 * 100 + x.roomprice[0].priceCase3 * (roomcount - 200) : x.roomprice[0].fixprice + gruptotal,
          'selected': x.selected,
          'desc': x.desc,
          'firstprice': x.firstprice
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

      this.dataSource.forEach(element => {
        if (element.firstprice[0].grupid != grupid1) {
          ekhizmetler.push(element);
          grupid1 = element.firstprice[0].grupid;
        }
      });
      this.ekhizmetler = ekhizmetler;


      this.dataSource.forEach(element => {
        if (element.selected == true) {

          if (element.firstprice[0].grupid != grupid) {
            singleprice += element.firstprice[0].price;
            grupid = element.firstprice[0].grupid;
          }

          totalprice += element.total;
        }

      });


      this.totalpricefinal = (totalprice * 12);
      this.firstprice = singleprice;



    } else { this.totalpricefinal = 0; }

  }

}


