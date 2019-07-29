import { Component, OnInit, ɵConsole, ViewContainerRef, ViewChild, TemplateRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import * as moment from 'moment';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { DialogComponent } from './dialog/dialog.component';



export interface PeriodicElement {
  productname: string;
  id: number;
  roomprice: any;
  total: number;
  selected: boolean;
}


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
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



  });

  public dataSource: any;
  roomCount: number = 0;
  alertmessage: string;
  offer: boolean = false;
  totalpricefinal: number;
  showpriceControl: boolean = true;
  overlayRef: OverlayRef;


  elementdata: PeriodicElement[] = [
    { id: 1, productname: 'ElektraWEB', roomprice: [{ 'priceCase1': 2, 'priceCase2': 1, 'priceCase3': 0.5 }], total: 0, selected: false },
    { id: 2, productname: 'POS', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false },
    { id: 3, productname: 'Stok', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false },
    { id: 4, productname: 'Muhasebe', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false },
    { id: 5, productname: 'eFatura', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false },
    { id: 6, productname: 'eArşiv', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false },
    { id: 7, productname: 'eDefter', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false },
    { id: 8, productname: 'Spa', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false },
    { id: 9, productname: 'Kimlik Okur', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false },
    { id: 10, productname: 'Isafe', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false },
    { id: 11, productname: 'Kapı Kilit', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false },
    { id: 12, productname: 'Tv', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false },
    { id: 13, productname: 'Isıtma Soğutma', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false },
    { id: 14, productname: 'WebServis', roomprice: [{ 'priceCase1': 1, 'priceCase2': 0.5, 'priceCase3': 0.25 }], total: 0, selected: false },

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
        const header = "<html><head><meta charset=UTF-8><style> thead th {width:50%;} table { margin-bottom:15px; font-family: arial, sans-serif;border-collapse: collapse; width: 100%;}" + "td, th {border: 1px solid #dddddd;padding: 8px;}" +

          "tr:nth-child(even) { background-color: #dddddd;}</style></head>" +
          "<body><div style=text-align:center><img src=https://www.elektraotel.com/wp-content/uploads/2019/05/elektraweblogo.png></div><br><strong></strong>" +
          "<br><div>" + "<table>" + "<thead><th>Firma Bilgileri</th><th>Teklif Tarihi :" + moment().format('YYYY/MM/DD') + "</th></thead><tbody>" +
          "<tr><td>Otel Adı : </td><td>" + formdata.hotelname + "</td></tr>" +
          "<tr><td>Yetkili Kişi: </td><td>" + formdata.authorized + "</td></tr>" +
          "<tr><td>Satıcı Adı ve Soyadı: </td><td>" + formdata.wantname + "</td></tr>" +
          "<tr><td>Oda Sayısı: </td><td>" + formdata.roomcount + "</td></tr>" +
          "<tr><td>E-mail: </td><td>" + formdata.email + "</td></tr>" +
          "<tr><td>Telefon: </td><td>" + formdata.phone + "</td></tr>"
          + "</tbody></table>" +
          "<table>" + "<thead><th>Ürünler</th><th>Fiyat</th></thead>" +
          "<tbody>";

        const footer = "</tbody></table></div></html>";


        let html = '';
        let total = 0;
        this.dataSource.forEach(element => {

          if (element.selected) {
            total += element.total;
            html += '<tr><td>' + element.productname + '</td>' +
              '<td><p style=text-align: end; padding: 0; margin: 0;>' + element.total + " € " + '</p></tr>';
          }
        });

        html += '<tr><td><strong>Toplam :</strong></td>' + '<td><strong>' + total + " € " + '</strong></td></tr>';



        let messagebody = header + html + footer;

        t.append('offer', messagebody);
        if (this.profileForm.valid) {
          this.http.post("teklifgonder.php", t
          ).subscribe(resp => { if (resp == "success") { alert("Teklifiniz Gönderildi."); } });
        }

        this.detachOverlay();
        alert("Teklifiniz Gönderildi.");

      }
    } else {alert("Lütfen Tüm Alanları Doldurunuz")}
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
        'selected': x.selected
      }));
    }


    if (roomcount >= 101 && roomcount <= 200) {

      this.dataSource = this.dataSource.map(x => ({
        'id': x.id,
        'productname': x.productname,
        'roomprice': x.roomprice,
        'total': (x.roomprice[0].priceCase1 * 100) + (x.roomprice[0].priceCase2 * roomcount - 100),
        'selected': x.selected
      }));

    }


    if (roomcount > 200) {

      this.dataSource = this.dataSource.map(x => ({

        'id': x.id,
        'productname': x.productname,
        'roomprice': x.roomprice,
        'total': x.roomprice[0].priceCase1 * 100 + x.roomprice[0].priceCase2 * 100 + (x.roomprice[0].priceCase3 * (roomcount - 200)),
        'selected': x.selected
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
          this.totalpricefinal = totalprice;
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
          this.totalpricefinal = totalprice1 + totalprice2;
        });
      }


      if (roomcount > 200) {
        this.dataSource.forEach(element => {
          if (element.selected == true) {

            totalprice1 += element.roomprice[0].priceCase1 * 100;
            totalprice2 += element.roomprice[0].priceCase2 * 100;
            totalprice3 += element.roomprice[0].priceCase3 * (roomcount - 200);

          }
          this.totalpricefinal = totalprice1 + totalprice2 + totalprice3;
        });
      }


    } else { this.totalpricefinal = 0; }

  }

}


