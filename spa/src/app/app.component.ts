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
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  langs: { label: string, value: string }[] = []

  sourceLang: string = 'en';
  targetLang: string = 'es';
  query = '';

  sourceJewels: IJewel[] = [];
  targetJewels: IJewel[] = [];
  queriedJewels: QueriedData[] = [];

  constructor(private jewelsService: JewelsService, private api: ApiService) { }

  ngOnInit(): void {
    this.api.getData<string[]>('langs.json').subscribe({
      next: (langs) => this.langs = langs.map(lang => { return { label: lang, value: lang } }),
    })

    this.onChangeSourceLang();
    this.onChangeTargetLang();
    this.onSearch();
  }

  onChangeSourceLang() {
    this.jewelsService.getByLang(this.sourceLang).subscribe({
      next: (jewels) => this.sourceJewels = jewels
    })
  }

  onChangeTargetLang() {
    this.jewelsService.getByLang(this.targetLang).subscribe({
      next: (jewels) => this.targetJewels = jewels
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
