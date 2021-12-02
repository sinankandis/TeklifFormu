import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxChange, MatGridTileHeaderCssMatStyler, throwToolbarMixedModesError } from '@angular/material';
import { Console } from 'console';
import { UserService } from '../admin/User.service';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
  myinfo = true;
  typeText :string = "password";
  bankForm: FormArray;
  contactForm: FormArray;
  billForm: FormGroup;
  myForm: FormGroup;
  constructor(
    public http: HttpClient,
    public fb: FormBuilder,
    public userservice: UserService
  ) { }

  ngOnInit() {
    this.bankForm = this.fb.array([])
    this.contactForm = this.fb.array([])
    this.billForm = this.fb.group(
      {
        title: [""],
        taxno: [""],
        mersisno: [""],
        fatadress: [""]
      }

    )

    this.myForm = this.fb.group(
      {
        name: [""],
        tel: [""],
        password: ["",Validators.minLength(8)]
      }

    )

    if(this.userservice.userdata[0]) {
      const data = this.userservice.userdata[0];
      this.myForm.controls.name.setValue(data.name);
      this.myForm.controls.tel.setValue(data.tel);
      this.myForm.controls.tel.setValue(data.tel);

    }

      if(this.userservice.userdata[0].usemyinfo) {
        if(this.userservice.userdata[0].usemyinfo==true) {
          this.myinfo = true;
        } else {
          this.myinfo = false;
        }
        
      }


    if (this.userservice.userdata[0].bankconfig) {
      const bankConfig = JSON.parse(this.userservice.userdata[0].bankconfig)
      bankConfig.forEach(element => {
        this.bankForm.push(this.fb.group(element))
      });
    }
    if (this.userservice.userdata[0].contactconfig) {
      const contactConfig = JSON.parse(this.userservice.userdata[0].contactconfig)

      contactConfig.forEach(element => {
        this.contactForm.push(this.fb.group(element))
      });
    }

    if (this.userservice.userdata[0].billconfig) {
      const billConfig = JSON.parse(this.userservice.userdata[0].billconfig)
      this.billForm.setValue(billConfig);
    }


  }

  showPass() {
    if(this.typeText=="password") {
      this.typeText = "text";
    } else {
      this.typeText = "password";

    }
  }

  myinfoCheck(e:MatCheckboxChange) {
    if(e.checked) {
      this.myinfo = true;
    } else {
      this.myinfo =false;
    }
  }

  saveInfo() {
    if(this.myForm.valid) {
    if (this.userservice.userdata[0].ID) {
      const data = { ID: this.userservice.userdata[0].ID,type:"usersaveinfo",usemyinfo:this.myinfo  , contact: this.contactForm.value, bank: this.bankForm.value, bill: this.billForm.value,myinfo:this.myForm.value };
      this.http.post(this.userservice.path + "/partnerinfo.php", JSON.stringify(data), { responseType: "json" }).subscribe((x: any) => {
      alert(x.message);
      })
    }
  }


  }

  back() {
    window.history.back();
  }

  addBank() {
    const group = this.fb.group({
      name: [''],
      iban: [''],
      bankno: [''],
      sube:[''],
      currency:['']
    })

    this.bankForm.push(group)

  }

  removeBank(i) {
    this.bankForm.removeAt(i);
  }


  addContact() {
    const group = this.fb.group({
      name: [],
      adress: [],
      tel: [],
      gsm: [],
      fax: []
    })
    this.contactForm.push(group)
  }

  removeContact(i) {
    this.contactForm.removeAt(i);
  }





}


