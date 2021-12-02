import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HttpClientModule } from '@angular/common/http';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { FullMaterialModule } from './full-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AdminComponent } from './admin/admin.component';
import { PriceComponent } from './price/price.component';
import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { InfoComponent } from './info/info.component';
import { ForgotpassowrdComponent } from './admin/forgotpassowrd/forgotpassowrd.component';
import { NewpasswordComponent } from './admin/forgotpassowrd/newpassword/newpassword.component';





@NgModule({
   declarations: [
      AppComponent,
      AdminComponent,
      PriceComponent,
      InfoComponent,
      ForgotpassowrdComponent,
      NewpasswordComponent
   ],
   imports: [
      BrowserModule,
      AppRoutingModule,
      BrowserAnimationsModule,
      FullMaterialModule,
      FormsModule,
      ReactiveFormsModule,
      FlexLayoutModule,
      HttpClientModule
   ],
   providers: [
      DecimalPipe,
   ],
   bootstrap: [
      AppComponent,
   ]
})
export class AppModule {
}
