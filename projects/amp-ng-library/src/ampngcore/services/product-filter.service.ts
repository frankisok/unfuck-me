import {Injectable} from '@angular/core';
import { ProductService } from './product.service';
import {takeUntil} from 'rxjs/operators';
import { AMPProduct } from '../models';
import { MediaType } from '../core';
import { BehaviorSubject } from 'rxjs';
import { UnSub } from '../core';

/**
 * Fetches products if they haven't been loaded already.
 * Checks if the data is already loaded and, if not,
 * triggers the loading process by calling the `loadProducts` method.
 * 
 * @example
 * // Usage example:
 * // In your component, inject the service in the constructor
 * constructor(private productFilterService: ProductFilterService) {}
 * // Then call the fetchProducts method on init to initialize the products in the background
 * ngOnInit(): void {
 *    this.productFilterService.fetchProducts();
 *    this.productFilterService.fetchComplete$.subscribe((value) => {
 *       if (value) {
 *          //... do something with the products,
 *          // ... or update some variables in your component
 *      }
 * }
 * 
 */
@Injectable()
export class ProductFilterService extends UnSub {
    private selectedAudioProducts: AMPProduct[]
    private selectedVideoProducts: AMPProduct[]
    private audioProducts: AMPProduct[]
    private videoProducts: AMPProduct[]
    dataLoaded = false;
    private fetchCompleteSubject = new BehaviorSubject<boolean>(this.dataLoaded);
    fetchComplete$ = this.fetchCompleteSubject.asObservable();
    
    constructor(
        private productService: ProductService,
        ) {
        super()
        /**
         * `this.fetchProducts()` 
         * This is approach is wrong because doesn't update until a page refresh for fetch that takes time,
         * please read on angular lifecycle hooks
         * 
         * When you load a page for the first time, the component is created and initialized. 
         * If the service is also created at this point and the data fetching is triggered, 
         * the `data variable` is set only when the data has been successfully fetched. 
         * This initial value depends on the completion of the asynchronous operation. 
         * If the data is fetched quickly, it might work as expected, but if the operation takes time, t
         * he component might be rendered with `data variable` not being set. meaning they not ready to use.
         * 
         * https://angular.io/guide/lifecycle-hooks
         * https://angular.io/tutorial/tour-of-heroes/toh-pt4
         */
        // this.fetchProducts()
    }

    /** This function should be called by any component that needs to use the products service to fetch products */
    public fetchProducts() {
        if (!this.dataLoaded) {
            // only fetch if not already loaded
            this.loadProducts()
        }
    }

    private loadProducts() {
        this.productService.fetchProducts()
            .pipe(
                takeUntil(this.unsubscribe$)
            )
            .subscribe(
                (products: AMPProduct[]) => {
                    this.audioProducts = products.filter(product => product.mediaType === MediaType.AUDIO)
                    this.videoProducts = products.filter(product => product.mediaType === MediaType.VIDEO)

                    // All products are selected on initial load
                    this.selectedAudioProducts = [...this.audioProducts]
                    this.selectedVideoProducts = [...this.videoProducts]
                    this.dataLoaded = true;
                    this.fetchCompleteSubject.next(this.dataLoaded);
                }
            )
    }

    public getProducts(mediaType: MediaType): AMPProduct[] {
        return mediaType === MediaType.AUDIO ? this.audioProducts : this.videoProducts
    }

    public getSelectedProducts(mediaType: MediaType): AMPProduct[] {
        return mediaType === MediaType.AUDIO ? this.selectedAudioProducts : this.selectedVideoProducts
    }

    public updateSelectedProducts(products: AMPProduct[], mediaType: MediaType) {
        if (mediaType === MediaType.AUDIO) {
            this.selectedAudioProducts = products
        }
        else {
            this.selectedVideoProducts = products
        }
    }


    public resetProducts()
    {
        this.selectedVideoProducts = this.videoProducts
        this.selectedAudioProducts = this.audioProducts
    }

    /** Retrieves an array of all products. at the moment this only used for the admin page under `Updates`*/
    public getAllProducts(): AMPProduct[] {
        return [...this.audioProducts, ...this.videoProducts]
    }

    /** * This function is called when the user logs out. to reset the dataLoaded flag, so that the products can be reloaded */
    public onLogout() {
        this.dataLoaded = false;
        this.fetchCompleteSubject.next(this.dataLoaded);
    }

}
