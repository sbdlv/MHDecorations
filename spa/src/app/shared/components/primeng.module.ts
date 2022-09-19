import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import {SkeletonModule} from 'primeng/skeleton';
import {InputTextModule} from 'primeng/inputtext';
import {TableModule} from 'primeng/table';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
  ],
  exports: [
    DropdownModule,
    SkeletonModule,
    InputTextModule,
    TableModule
  ]
})
export class PrimengModule { }
