import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import {SkeletonModule} from 'primeng/skeleton';
import {InputTextModule} from 'primeng/inputtext';
import {TableModule} from 'primeng/table';
import {CardModule} from 'primeng/card';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AccordionModule } from 'primeng/accordion';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

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
    ProgressSpinnerModule
  ]
})
export class PrimengModule { }
