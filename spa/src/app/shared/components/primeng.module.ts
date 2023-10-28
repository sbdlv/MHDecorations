import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  exports: [
    DropdownModule,
    SkeletonModule,
    InputTextModule,
    TableModule,
    CardModule,
    SelectButtonModule,
    AccordionModule,
    ToastModule,
    ProgressSpinnerModule,
    ButtonModule,
    InputSwitchModule
  ]
})
export class PrimengModule { }
