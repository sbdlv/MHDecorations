import { Component, OnInit } from '@angular/core';
import { MessageService } from 'primeng/api';
import { forkJoin } from 'rxjs';
import { notFoundTexts } from 'src/assets/not_found_texts';
import { ApiService } from './shared/services/api.service';
import { DecorationsService, IDecoration } from './shared/services/decorations.service';

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

interface IJoinedDecoration extends IDecoration {
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

  decorations!: IJoinedDecoration[];
  filteredDecorations!: IJoinedDecoration[];

  sourceDecorations: IDecoration[] = [];
  targetDecorations: IDecoration[] = [];
  queriedDecorations: QueriedData[] = [];

  bookmarkedDecorations: Set<IJoinedDecoration> = new Set();

  isLoadingData = true;

  onlyBookmarked = false;

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
    private decorationsService: DecorationsService,
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
      sourceDecorations: this.decorationsService.getByLang(this.sourceLang.code),
      targetDecorations: this.decorationsService.getByLang(this.targetLang.code),
    }).subscribe({
      next: (data) => {
        this.decorations = data.targetDecorations.map(targetDecoration => {
          const originalData = data.sourceDecorations.find(sourceDecoration => sourceDecoration.id == targetDecoration.id);

          return {
            ...targetDecoration,
            // Just in case some data is missing, set a error string
            sourceName: originalData?.name || 'NOT FOUND'
          }
        })

        // Filter all the data at once
        this.filterData();
        this.isLoadingData = false;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Couldn\'t obtain decorations data. Please refresh the page' })
    })
  }

  onChangeSourceLang() {
    localStorage.setItem('sourceLang', JSON.stringify(this.sourceLang));

    this.isLoadingData = true;
    this.decorationsService.getByLang(this.sourceLang.code).subscribe({
      next: (sourceDecorations) => {
        // Rewrite decorations data
        this.decorations = this.decorations.map(decoration => {
          const sourceDecoration = sourceDecorations.find(sourceDecoration => sourceDecoration.id == decoration.id);

          return {
            ...decoration,
            sourceName: sourceDecoration?.name || 'NOT FOUND'
          }
        })
        this.filterData();
        this.isLoadingData = false;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Couldn\'t obtain decorations data. Please refresh the page' })
    });
  }

  onChangeTargetLang() {
    localStorage.setItem('targetLang', JSON.stringify(this.targetLang));

    this.isLoadingData = true;
    this.decorationsService.getByLang(this.targetLang.code).subscribe({
      next: (targetDecorations) => {
        // Rewrite decorations data
        this.decorations = this.decorations.map(decoration => {
          const targetDecoration = targetDecorations.find(targetDecoration => targetDecoration.id == decoration.id);

          return {
            ...decoration,
            ...targetDecoration
          }
        })
        this.filterData();
        this.isLoadingData = false;
      },
      error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Couldn\'t obtain decorations data. Please refresh the page' })
    });
  }

  filterData() {
    const lowerCaseQuery = this.searchText.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    this.filteredDecorations = this.decorations
      .filter(decoration => !this.onlyBookmarked || this.bookmarkedDecorations.has(decoration))
      .filter(decoration => decoration.name.toLocaleLowerCase().search(lowerCaseQuery) > -1 || decoration.sourceName.toLocaleLowerCase().search(lowerCaseQuery) > -1)
      .filter(decoration => !this.decorationLevels.length || this.decorationLevels.includes(decoration.level))
      .filter(decoration => !this.abilityLevels.length || this.abilityLevels.includes(decoration.skill_level))
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

  bookmarkClick(decoration: IJoinedDecoration) {
    if (this.bookmarkedDecorations.has(decoration)) {
      this.bookmarkedDecorations.delete(decoration);
      // Delete the decoration from the filtered array if onlyBookmarked mode is activated.
      if (this.onlyBookmarked) {
        this.filteredDecorations.splice(this.filteredDecorations.findIndex(filteredDecoration => filteredDecoration.id == decoration.id), 1);
      }
    } else {
      this.bookmarkedDecorations.add(decoration);
    }
  }

  getNotFoundText() {
    return notFoundTexts[this.targetLang.code] || 'Nothing found';
  }
}
