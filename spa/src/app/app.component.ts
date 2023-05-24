import { Component, OnInit } from '@angular/core';
import { ApiService } from './shared/services/api.service';
import { IJewel, JewelsService } from './shared/services/jewels.service';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';

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

interface IJoinedJewel extends IJewel {
  sourceName: string
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

  jewels!: IJoinedJewel[];
  filteredJewels!: IJoinedJewel[];

  sourceJewels: IJewel[] = [];
  targetJewels: IJewel[] = [];
  queriedJewels: QueriedData[] = [];

  isLoadingData = true;

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
  ) { }

  ngOnInit(): void {
    this.setSourceAndTargetLanguageSelections();

    this.api.getData<ILang[]>('langs.json').subscribe({
      next: (langs) => this.langs = langs,
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Couldn\'t obtain languages. Please refresh the page' })
    })

    forkJoin({
      sourceJewels: this.jewelsService.getByLang(this.sourceLang.code),
      targetJewels: this.jewelsService.getByLang(this.targetLang.code),
    }).subscribe({
      next: (data) => {
        this.jewels = data.targetJewels.map(targetJewel => {
          const originalData = data.sourceJewels.find(sourceJewel => sourceJewel.id == targetJewel.id);

          return {
            ...targetJewel,
            // Just in case some data is missing, set a error string
            sourceName: originalData?.name || 'NOT FOUND'
          }
        })

        // Filter all the data at once
        this.filterData();
        this.isLoadingData = false;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Couldn\'t obtain jewels data. Please refresh the page' })
    })
  }

  onChangeSourceLang() {
    localStorage.setItem('sourceLang', JSON.stringify(this.sourceLang));

    this.isLoadingData = true;
    this.jewelsService.getByLang(this.sourceLang.code).subscribe({
      next: (sourceJewels) => {
        // Rewrite jewels data
        this.jewels = this.jewels.map(jewel => {
          const sourceJewel = sourceJewels.find(sourceJewel => sourceJewel.id == jewel.id);

          return {
            ...jewel,
            sourceName: sourceJewel?.name || 'NOT FOUND'
          }
        })
        this.filterData();
        this.isLoadingData = false;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Couldn\'t obtain jewels data. Please refresh the page' })
    });
  }

  onChangeTargetLang() {
    localStorage.setItem('targetLang', JSON.stringify(this.targetLang));

    this.isLoadingData = true;
    this.jewelsService.getByLang(this.targetLang.code).subscribe({
      next: (targetJewels) => {
        // Rewrite jewels data
        this.jewels = this.jewels.map(jewel => {
          const targetJewel = targetJewels.find(targetJewel => targetJewel.id == jewel.id);

          return {
            ...jewel,
            ...targetJewel
          }
        })
        this.filterData();
        this.isLoadingData = false;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Couldn\'t obtain jewels data. Please refresh the page' })
    });
  }

  filterData() {
    const lowerCaseQuery = this.searchText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    this.filteredJewels = this.jewels
      .filter(jewel => jewel.name.toLocaleLowerCase().search(lowerCaseQuery) > -1 || jewel.sourceName.toLocaleLowerCase().search(lowerCaseQuery) > -1)
      .filter(jewel => !this.decorationLevels.length || this.decorationLevels.includes(jewel.level))
      .filter(jewel => !this.abilityLevels.length || this.abilityLevels.includes(jewel.skill_level))
  }

  private setSourceAndTargetLanguageSelections() {
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
}
