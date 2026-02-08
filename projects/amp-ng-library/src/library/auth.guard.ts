import { ActivatedRouteSnapshot, RouterStateSnapshot, Router, UrlTree, CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LibraryConfigService } from './library-config-service';

// export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
//   const account = inject(LibraryConfigService);
//   return of(!!account.accountInfo.accountId && !!account.accountInfo.email && !!account.accountInfo.token)
// };
export const authGuard: CanActivateFn = (): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree => {
    const account = inject(LibraryConfigService);
    return of(!!account.accountInfo.accountId && !!account.accountInfo.email && !!account.accountInfo.token)
};