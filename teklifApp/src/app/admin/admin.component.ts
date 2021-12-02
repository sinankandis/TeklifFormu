import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { UserService } from './User.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  message: string;


  constructor(private http: HttpClient, private service: UserService, private router: Router) { }

  loginForm = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
  });


  onSubmit() {
    if (this.loginForm.valid) {
      this.http.post(this.service.path+"/login.php", this.loginForm.value).subscribe(resp => {
        if (resp == false) {
          this.message = "Please Check Your Information";
        } else {
          this.service.userinfo = this.loginForm.value;
          let data = [];
          data.push(resp);
          this.service.userdata = data;
          if (data[0].email != "" && data[0].email != null) {
            this.service.login = true;
            this.router.navigate([""]);
          }
        }
      }
      );

    }
  }




  ngOnInit() {
  }

}
