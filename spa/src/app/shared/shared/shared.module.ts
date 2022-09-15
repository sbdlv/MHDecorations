import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../components/components.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ApiService } from '../services/api.service';
import { HttpClientModule } from '@angular/common/http';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  exports: [
    ComponentsModule,
    BrowserAnimationsModule,
  ],
  providers: [
    ApiService
  ]
})
export class SharedModule { }
