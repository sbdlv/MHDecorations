import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ApiService } from './shared/services/api.service';
import { IJewel, JewelsService } from './shared/services/jewels.service';
import { MessageService } from 'primeng/api';

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
  styleUrls: ['./app.component.scss'],
  providers: [MessageService]
})
export class AppComponent implements OnInit {
  langs: ILang[] = []

  sourceLang!: ILang;
  targetLang!: ILang;

  sourceJewels: IJewel[] = [];
  targetJewels: IJewel[] = [];
  queriedJewels: QueriedData[] = [];

  isLoadingTargetData = true;
  isLoadingSourceData = true;

  // Filters

  readonly decorationLevelOptions = [
    { name: '1', value: 1 },
    { name: '2', value: 2 },
    { name: '3', value: 3 },
    { name: '4', value: 4 },
  ];

  readonly abilityLevelOptions = [
    { name: '1', value: 1 },
    { name: '2', value: 2 },
    { name: '3', value: 3 },
    { name: '4', value: 4 },
    { name: '5', value: 5 },
  ];

  searchText = '';
  decorationLevels: number[] = [];
  abilityLevels: number[] = [];


  constructor(
    private jewelsService: JewelsService,
    private api: ApiService,
    private messageService: MessageService
  ) {
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
      next: (langs) => this.langs = langs,
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Couldn\'t obtain languages. Please refresh the page' })
    })

    this.onChangeSourceLang();
    this.onChangeTargetLang();
  }

  onChangeSourceLang() {
    localStorage.setItem('sourceLang', JSON.stringify(this.sourceLang));

    this.isLoadingSourceData = true;
    this.jewelsService.getByLang(this.sourceLang.code).subscribe({
      next: (jewels) => {
        this.sourceJewels = jewels;
        this.filterData();
        this.isLoadingSourceData = false;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Couldn\'t obtain jewels data. Please refresh the page' })
    })
  }

  onChangeTargetLang() {
    localStorage.setItem('targetLang', JSON.stringify(this.targetLang));

    this.isLoadingTargetData = true;
    this.jewelsService.getByLang(this.targetLang.code).subscribe({
      next: (jewels) => {
        this.targetJewels = jewels
        this.filterData();
        this.isLoadingTargetData = false;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Couldn\'t obtain jewels data. Please refresh the page' })
    })
  }

  filterData() {
    // Search jewels from both languages
    const matchedJewelsSourceLang = this.filterJewels(this.sourceJewels);
    const matchedJewelsTargetLang = this.filterJewels(this.targetJewels);

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

  private filterJewels(jewels: IJewel[]) {
    const lowerCaseQuery = this.searchText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    return jewels
      .filter(jewel => jewel.name.toLocaleLowerCase().search(lowerCaseQuery) > -1)
      .filter(jewel => !this.decorationLevels.length || this.decorationLevels.includes(jewel.level))
      .filter(jewel => !this.abilityLevels.length || this.abilityLevels.includes(jewel.skill_level))
  }
}
