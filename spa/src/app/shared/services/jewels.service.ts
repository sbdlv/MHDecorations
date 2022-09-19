import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface IJewel {
  id: string,
  name: string,
  ability: string
  desc: string
}

@Injectable({
  providedIn: 'root'
})
export class JewelsService {

  constructor(private api: ApiService) { }

  getByLang(lang: string) {
    return this.api.getData<IJewel[]>(`jewels.${lang}.json`)
  }
}
