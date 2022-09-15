import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ApiService } from './shared/services/api.service';
import { IJewel, JewelsService } from './shared/services/jewels.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  langs: { label: string, value: string }[] = []

  loadingLangs = false;

  sourceLang: string = 'en';
  query = '';

  sourceJewels: IJewel[] = [];
  targetJewels: IJewel[] = [];

  constructor(private jewelsService: JewelsService, private api: ApiService) { }

  ngOnInit(): void {
    this.api.getData<string[]>('langs.json').subscribe({
      next: (langs) => this.langs = langs.map(lang => { return { label: lang, value: lang } }),
    })
  }

  onChangeSourceLang() {
    this.jewelsService.getByLang(this.sourceLang).subscribe({
      next: (jewels) => this.sourceJewels = jewels
    })
  }
}
