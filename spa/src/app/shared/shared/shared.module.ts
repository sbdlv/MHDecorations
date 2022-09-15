import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComponentsModule } from '../components/components.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  exports: [
    ComponentsModule,
    BrowserAnimationsModule
  ]
})
export class SharedModule { }
