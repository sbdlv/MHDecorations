import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ApiService } from './shared/services/api.service';
import { IJewel, JewelsService } from './shared/services/jewels.service';

interface QueriedData {
  id: string,
  sourceName: string,
  targetName?: string,
  desc?: string,
  ability?: string,
}

interface ILang {
  name: string,
  flag: string,
  code: string
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  langs: ILang[] = []

  sourceLang: ILang = {
    name: 'English',
    flag: 'gb',
    code: 'en'
  };
  targetLang: ILang = {
    name: 'Spanish',
    flag: 'es',
    code: 'es'
  };
  query = '';

  sourceJewels: IJewel[] = [];
  targetJewels: IJewel[] = [];
  queriedJewels: QueriedData[] = [];

  constructor(private jewelsService: JewelsService, private api: ApiService) { }

  ngOnInit(): void {
    this.api.getData<ILang[]>('langs.json').subscribe({
      next: (langs) => this.langs = langs
    })

    this.onChangeSourceLang();
    this.onChangeTargetLang();
  }

  onChangeSourceLang() {
    this.jewelsService.getByLang(this.sourceLang.code).subscribe({
      next: (jewels) => {
        this.sourceJewels = jewels;
        this.onSearch();
      }
    })
  }

  onChangeTargetLang() {
    this.jewelsService.getByLang(this.targetLang.code).subscribe({
      next: (jewels) => {
        this.targetJewels = jewels
        this.onSearch();
      }
    })
  }

  onSearch() {
    const lowerCaseQuery = this.query.toLowerCase();
    const matchedJewels = this.sourceJewels.filter(jewel => jewel.name.toLocaleLowerCase().search(lowerCaseQuery) > -1)

    this.queriedJewels = matchedJewels.map(matchedJewel => {
      const targetLangJewel = this.targetJewels.find(jewel => jewel.id === matchedJewel.id);

      return {
        id: matchedJewel.id,
        sourceName: matchedJewel.name,
        targetName: targetLangJewel?.name,
        desc: targetLangJewel?.desc,
        ability: targetLangJewel?.ability
      }
    })
  }
}
