import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { PriceComponent } from './price/price.component';
import { UserService } from './admin/User.service';


const routes: Routes = [
  { path: "login", component: AdminComponent },
  { path: "", component: PriceComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
