import { Component, OnInit } from '@angular/core';
import { LibraryComponent } from 'amp-ng-library';

@Component({
    selector: 'app-product-wrapper',
    templateUrl: './product-wrapper.component.html',
    standalone: true,
    imports: [LibraryComponent]
})
export class ProductWrapperComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
