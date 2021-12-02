import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../User.service';

@Component({
  selector: 'app-newpassword',
  templateUrl: './newpassword.component.html',
  styleUrls: ['./newpassword.component.scss']
})
export class NewpasswordComponent implements OnInit {
  typeText = "password";
  email: string;
  hash: string;
  passForm: FormGroup = this.fb.group({
    password: ["", [Validators.required, Validators.minLength(8)]],
    passwordconfirm: ["", [Validators.required, Validators.minLength(8)]],
  });
  constructor(private fb: FormBuilder, private http: HttpClient, private userservice: UserService,private route: ActivatedRoute) {
    this.route.queryParams.subscribe(params => {
      this.email = params['user'];
      this.hash = params['hash'];
  });
   }

  ngOnInit() {
    
  }

  resetPassword() {
    if (this.passForm.valid) {
      if (this.passForm.controls.password.value == this.passForm.controls.passwordconfirm.value) {
        const data = { username:this.email,hash:this.hash,password: this.passForm.controls.password.value, type: "newpassword" };
        this.http.post(this.userservice.path + "/partnerinfo.php", JSON.stringify(data), { responseType: "json" }).subscribe((x: any) => {
          alert(x.message);
        })
      } else {
        alert("Don't match Password");
      }

    }
  }


  showPass() {
    if (this.typeText == "password") {
      this.typeText = "text";
    } else {
      this.typeText = "password";

    }
  }

}
