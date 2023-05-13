import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ApiService } from './shared/services/api.service';
import { IJewel, JewelsService } from './shared/services/jewels.service';

interface QueriedData {
  id: string,
  sourceName?: string,
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

  sourceLang!: ILang;
  targetLang!: ILang;
  query = '';

  sourceJewels: IJewel[] = [];
  targetJewels: IJewel[] = [];
  queriedJewels: QueriedData[] = [];

  constructor(private jewelsService: JewelsService, private api: ApiService) {
    const localStorageSourceLang = localStorage.getItem('sourceLang');
    const localStorageTargetLang = localStorage.getItem('targetLang');

    if (localStorageSourceLang) {
      this.sourceLang = JSON.parse(localStorageSourceLang);
    } else {
      // Default value
      this.sourceLang = {
        name: 'English',
        flag: 'gb',
        code: 'en'
      };
    }
    if (localStorageTargetLang) {
      this.targetLang = JSON.parse(localStorageTargetLang);
    } else {
      // Default value
      this.targetLang = {
        name: 'Spanish',
        flag: 'es',
        code: 'es'
      };
    }
  }

  ngOnInit(): void {
    this.api.getData<ILang[]>('langs.json').subscribe({
      next: (langs) => this.langs = langs
    })

    this.onChangeSourceLang();
    this.onChangeTargetLang();
  }

  onChangeSourceLang() {
    localStorage.setItem('sourceLang', JSON.stringify(this.sourceLang));

    if (this.sourceLang)
      this.jewelsService.getByLang(this.sourceLang.code).subscribe({
        next: (jewels) => {
          this.sourceJewels = jewels;
          this.onSearch();
        }
      })
  }

  onChangeTargetLang() {
    localStorage.setItem('targetLang', JSON.stringify(this.targetLang));

    if (this.targetLang)
      this.jewelsService.getByLang(this.targetLang.code).subscribe({
        next: (jewels) => {
          this.targetJewels = jewels
          this.onSearch();
        }
      })
  }

  onSearch() {
    const lowerCaseQuery = this.query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    // Search jewels from both languages
    const matchedJewelsSourceLang = this.sourceJewels.filter(jewel =>
      jewel.name.toLocaleLowerCase().search(lowerCaseQuery) > -1)
    const matchedJewelsTargetLang = this.targetJewels.filter(jewel =>
      jewel.name.toLocaleLowerCase().search(lowerCaseQuery) > -1)

    // Create a collection with the matched jewels IDs form both languages
    const joinedMatchedIDs = new Set<string>(
      [
        ...matchedJewelsSourceLang.map(jewel => jewel.id),
        ...matchedJewelsTargetLang.map(jewel => jewel.id)
      ]
    );

    // Get the data for the matched IDs
    this.queriedJewels = Array.from(joinedMatchedIDs).map(matchedJewelID => {
      const targetLangJewel = this.targetJewels.find(jewel => jewel.id === matchedJewelID);

      return {
        id: matchedJewelID,
        sourceName: this.sourceJewels.find(jewel => jewel.id === matchedJewelID)?.name,
        targetName: targetLangJewel?.name,
        desc: targetLangJewel?.desc,
        ability: targetLangJewel?.ability
      }
    })
  }
}
