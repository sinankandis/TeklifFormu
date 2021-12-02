import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../User.service';

@Component({
  selector: 'app-forgotpassowrd',
  templateUrl: './forgotpassowrd.component.html',
  styleUrls: ['./forgotpassowrd.component.scss']
})
export class ForgotpassowrdComponent implements OnInit {
  emailForm : FormGroup = this.fb.group({
    email :["",[Validators.required,Validators.email]]
  });
  constructor( private fb:FormBuilder, private http:HttpClient,private userservice:UserService) { }

  ngOnInit() {
    
  }

  resetPassword() {
    if(this.emailForm.valid) {
      const data = { email: this.emailForm.controls.email.value,type:"resetpassword" };
      this.http.post(this.userservice.path + "/partnerinfo.php", JSON.stringify(data), { responseType: "json" }).subscribe((x: any) => {
           alert(x.message);
      })

    }
  }


  back() {
    window.history.back();
  }

}
