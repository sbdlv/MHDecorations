import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

export interface IDecoration {
  id: string,
  name: string,
  ability: string
  desc: string,
  level: number,
  skill_level: number
}

@Injectable({
  providedIn: 'root'
})
export class DecorationsService {

  constructor(private api: ApiService) { }

  getByLang(lang: string) {
    return this.api.getData<IDecoration[]>(`decorations.${lang}.json`);
  }
}
