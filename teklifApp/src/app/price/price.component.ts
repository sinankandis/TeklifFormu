
import { Component, OnInit, ɵConsole, ViewContainerRef, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';



export interface PeriodicElement {
  productname: string;
  id: number;
  roomprice: any;
  total: number;
  selected: boolean;
  desc: string;
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
    public dialog: MatDialog) { }


  profileForm = new FormGroup({
    hotelname: new FormControl('', Validators.required),
    roomcount: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    authorized: new FormControl('', Validators.required),
    wantname: new FormControl(''),
    wantemail: new FormControl(''),
    wantphone: new FormControl(''),



  });

  public dataSource: any;
  roomCount: number = 0;
  alertmessage: string;
  offer: boolean = false;
  totalpricefinal: number;
  showpriceControl: boolean = true;
  overlayRef: OverlayRef;


  elementdata: PeriodicElement[] = [
    { id: 1, productname: 'ElektraWEB', roomprice: [{ 'priceCase1': 2, 'priceCase2': 1, 'priceCase3': 0.5 }], total: 0, selected: false, desc: 'Rezervasyon, Check In, Check Out, Folyo,Fatura, Kasa, Housekeeping, Acenta, Misafir,Cari Hesaplar, Doluluk ve Karlılık Analizleri,Gece Raporu, Yedekleme, Room Rack, Emniyet,Kimlik Bildirim Raporu' },
    { id: 2, productname: 'POS', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false, desc: '' },
    { id: 3, productname: 'Stok', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false, desc: '' },
    { id: 4, productname: 'Muhasebe', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false, desc: '' },
    { id: 5, productname: 'eFatura', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false, desc: '' },
    { id: 6, productname: 'eArşiv', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false, desc: '' },
    { id: 7, productname: 'eDefter', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false, desc: '' },
    { id: 8, productname: 'Spa', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false, desc: '' },
    { id: 11, productname: 'Kapı Kilit', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false, desc: '' },
    { id: 12, productname: 'Tv', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false, desc: '' },
    { id: 13, productname: 'Isıtma Soğutma', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false, desc: '' },
    { id: 14, productname: 'WebServis', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false, desc: '' },

  ];


  openDialog() {
    // const dialogConfig = new MatDialogConfig();
    //dialogConfig.width ="30%";
    //this.dialog.open(DialogComponent,dialogConfig)
  }


  ngOnInit() {



    this.dataSource = this.elementdata;
    this.total(0);

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

        let html = '';
        let total = 0;
        this.dataSource.forEach(element => {

          if (element.selected) {
            total += element.total;
            html += '<tr><td style="width:50%;"><strong>' + element.productname + '</strong><p>' + element.desc + '<p></td>' +
              '<td>' + formdata.roomcount + '</td>' +
              '<td style="text-align: right;"><p style=text-align: right; padding: 0; margin: 0;>' + element.total + " €/ay " + '</p></tr>';
          }
        });

        html += '<tr><td><strong>Yıllık Toplam :</strong></td><td></td>' + '<td style="text-align: right;"><strong>' + total * 12 + " € " + '</strong>(' + total +' € * 12 )</td></tr>';
        let messagebody = html;
        t.append('offer', messagebody);
        if (this.profileForm.valid) {
          this.http.post("teklifgonder.php", t
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
      this.dataSource = this.dataSource = this.dataSource.map(x => ({
        'id': x.id,
        'productname': x.productname,
        'roomprice': x.roomprice,
        'total': x.roomprice[0].priceCase1 * roomcount,
        'selected': x.selected,
        'desc': x.desc
      }));
    }


    if (roomcount >= 101 && roomcount <= 200) {

      this.dataSource = this.dataSource.map(x => ({
        'id': x.id,
        'productname': x.productname,
        'roomprice': x.roomprice,
        'total': (x.roomprice[0].priceCase1 * 100) + (x.roomprice[0].priceCase2 * roomcount - 100),
        'selected': x.selected,
        'desc': x.desc
      }));

    }


    if (roomcount > 200) {

      this.dataSource = this.dataSource.map(x => ({

        'id': x.id,
        'productname': x.productname,
        'roomprice': x.roomprice,
        'total': x.roomprice[0].priceCase1 * 100 + x.roomprice[0].priceCase2 * 100 + (x.roomprice[0].priceCase3 * (roomcount - 200)),
        'selected': x.selected,
        'desc': x.desc
      }));


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
      let totalprice1 = 0;
      let totalprice2 = 0;
      let totalprice3 = 0;
      if (roomcount <= 100) {
        this.dataSource.forEach(element => {
          if (element.selected == true) {
            totalprice += element.roomprice[0].priceCase1 * roomcount;
          }
          this.totalpricefinal = totalprice * 12;
        });
      }


      if (roomcount >= 101 && roomcount <= 200) {
        this.dataSource.forEach(element => {
          if (element.selected == true) {

            if (roomcount - 100 <= 100) {
              totalprice1 += element.roomprice[0].priceCase1 * 100;
            }

            if (roomcount > 100 && roomcount <= 200) {
              totalprice2 += element.roomprice[0].priceCase2 * roomcount - 100;
            }
          }
          this.totalpricefinal = (totalprice1 + totalprice2) * 12;
        });
      }


      if (roomcount > 200) {
        this.dataSource.forEach(element => {
          if (element.selected == true) {

            totalprice1 += element.roomprice[0].priceCase1 * 100;
            totalprice2 += element.roomprice[0].priceCase2 * 100;
            totalprice3 += element.roomprice[0].priceCase3 * (roomcount - 200);

          }
          this.totalpricefinal = (totalprice1 + totalprice2 + totalprice3) * 12;
        });
      }


    } else { this.totalpricefinal = 0; }

  }

}


