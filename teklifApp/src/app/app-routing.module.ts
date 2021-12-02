import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { PriceComponent } from './price/price.component';
import { UserService } from './admin/User.service';
import { InfoComponent } from './info/info.component';
import { ForgotpassowrdComponent } from './admin/forgotpassowrd/forgotpassowrd.component';
import { NewpasswordComponent } from './admin/forgotpassowrd/newpassword/newpassword.component';


const routes: Routes = [
  { path: "login", component: AdminComponent },
  { path: "info", component: InfoComponent },
  { path: "password", component: ForgotpassowrdComponent },
  { path: "newpassword", component: NewpasswordComponent },
  { path: "", component: PriceComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
