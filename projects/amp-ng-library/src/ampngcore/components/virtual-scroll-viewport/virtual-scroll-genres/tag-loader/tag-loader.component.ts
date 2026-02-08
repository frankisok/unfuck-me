import { Component, OnInit, Input, ChangeDetectorRef, OnChanges, SimpleChanges } from '@angular/core';
import { ContentService } from '../../../../services/content.service';

@Component({
  selector: 'lib-tag-loader',
  template: `
    <div *ngIf="loading">Loading...</div>
    <div *ngIf="!loading" class="d-inline">{{ genreList }}</div>
  `,
  standalone: false
})

export class TagLoaderComponent implements OnInit, OnChanges {

  @Input() item: any;

  genreList: string = '';
  loading = true;

  constructor(
    private contentService: ContentService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // this.contentService.getContentItemTags(this.item.id).subscribe(tags => {
    //   this.genreList = tags.map(tag => tag.name).join(', ');
    //   this.loading = false;
    //   this.cdr.markForCheck();
    // });
  }


  ngOnChanges(changes: SimpleChanges): void {
    this.contentService.getContentItemTags(this.item.id).subscribe(tags => {
      this.genreList = tags.map(tag => tag.name).join(', ');
      this.loading = false;
      this.cdr.markForCheck();
    });
  }

}
