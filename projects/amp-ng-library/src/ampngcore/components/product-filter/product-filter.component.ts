import { ChangeDetectionStrategy,Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

import { LibraryAssetsService, ProductFilterService, ProductService } from '../../service';
import { MediaType, ProductType } from '../../core';
import { AMPProduct } from '../../models';
// import {UnSub} from '../../_util/unsub.class';
import { cloneDeep } from 'lodash'
// import { EventBusService } from 'app/_services/event-bus.service';
// import { AMPEvent, AMPEventName } from 'app/_protocols/events-protocol';
import { Subject, Subscription } from 'rxjs';
import { EProduct } from '../../core';
import { LibraryConfigService } from '../../../library/library-config-service';


@Component({
    selector: 'amp-product-filter',
    templateUrl: './product-filter.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    styleUrls: ['./product-filter.component.scss'],
    standalone: false
})
export class ProductFilterComponent implements OnInit {
    unsubscribe$ = new Subject<void>()


    @Input() mediaType: MediaType;
    @Input() productFilterType: ProductType

    @Output() selectedProductsBundleIds: EventEmitter<number[]> = new EventEmitter<number[]>();
    @Output() allProductsBundleIds: EventEmitter<number[]> = new EventEmitter<number[]>();


    isVisible = false;
    products: AMPProduct[]
    selectedProducts: AMPProduct[]
    fetchComplete = false;
    private fetchCompleteSubscription: Subscription;
    applyGlobally: boolean

    constructor(
        private productService: ProductService,
        private productFilterService: ProductFilterService,
        // private account: AccountService,
        private configService: LibraryConfigService,
        protected assetsService: LibraryAssetsService,
        // private eventBus: EventBusService,
    ) {
        // super()
    }

    ngOnInit(): void {
        this.applyGlobally = this.productFilterType === EProduct.AUDIO_LIBRARY || this.productFilterType === EProduct.VIDEO_LIBRARY
        // this.loadProducts();
        this.fetchCompleteSubscription = this.productFilterService.fetchComplete$.subscribe((value) => {
            this.fetchComplete = value;
            if (value) {
                this.loadProducts();
            }
        });
        this.productFilterService.fetchProducts();

    }

    ngOnDestroy(): void {
        this.unsubscribe$.next()
        this.unsubscribe$.complete()
    }

    getDisplayName(product) {
        const productTranslation = product.translations.find(translation => translation.language === this.configService.getLanguage());
        return (productTranslation) ? productTranslation.displayName : product.name;
    }

    getProductImage(product) {
        return this.productService.thumbnailImage(product.name);
    }

    private loadProducts() {
        this.products = cloneDeep(this.productFilterService.getProducts(this.mediaType))
        this.selectedProducts = cloneDeep(this.productFilterService.getSelectedProducts(this.mediaType))
        const bundleIds = this.extractBundleIds(this.selectedProducts)
        // this.selectedProductsBundleIds.emit(bundleIds)
        this.allProductsBundleIds.emit(bundleIds)
    }

    private extractBundleIds(productList: AMPProduct[]): number[] {
        return productList.map((product: AMPProduct) => product.contentBundleId)
    }

    public isActiveProduct(productToCheck: AMPProduct) {
        return this.selectedProducts.find((product: AMPProduct) => product.identifier === productToCheck.identifier)
    }

    public clickProductCard(product: AMPProduct) {
        if (this.isActiveProduct(product)) {
            this.deselectProduct(product)
        }
        else {
            this.selectProduct(product)
        }
    }

     private selectProduct(product: AMPProduct) {
        this.selectedProducts.push(product)
         if (this.applyGlobally) {
             this.productFilterService.updateSelectedProducts(this.selectedProducts, this.mediaType)
         }
         this.applyFilter()
     }

     private deselectProduct(product: AMPProduct) {
        if (this.selectedProducts.length > 1) {
            this.selectedProducts = this.selectedProducts.filter((selectedProduct: AMPProduct) => selectedProduct.identifier !== product.identifier)
            if (this.applyGlobally) {
                this.productFilterService.updateSelectedProducts(this.selectedProducts, this.mediaType)
            }
            this.applyFilter()
        }
     }


    applyFilter() {
        const bundleIds = this.extractBundleIds(this.selectedProducts)
        this.selectedProductsBundleIds.emit(bundleIds);
    }

    public getButtonToggleDisplay() {
        return (this.isVisible) ? 'Hide' : 'Products';
    }

    public toggleVisibility() {
        this.isVisible = !this.isVisible;
    }

    leftScroll() {
        const container = document.querySelector('#panel-outer-body');
        container.scrollLeft -= 200;
    }

    rightScroll() {
        const container = document.querySelector('#panel-outer-body');
        container.scrollLeft += 200;
    }

}
