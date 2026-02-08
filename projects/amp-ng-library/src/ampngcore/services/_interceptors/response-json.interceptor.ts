import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isInteger, parse } from 'lossless-json';

// export function customNumberParser(value) {
//     return isInteger(value) && value.length > 15 ? BigInt(value) : parseFloat(value)
// }

/**
 * Parses a number or string value to a BigInt or number, depending on its value.
 * If the value exceeds the maximum safe integer value, it will be converted to a BigInt.
 * @param value The number or string value to parse.
 * @returns A BigInt or number value, depending on the input value.
 * @throws An error if the input value is not a number or string.
 */
export function customNumberParser(value: string | number): BigInt | number {
    if (typeof value === 'string') {
        const intValue = parseInt(value, 10);
        return Number.isSafeInteger(intValue) ? intValue : BigInt(value);
    } else if (typeof value === 'number') {
        return Number.isSafeInteger(value) ? value : BigInt(value);
    } else {
        throw new Error('Invalid value type');
    }
}

@Injectable()
export class ResponseJsonInterceptor implements HttpInterceptor {
    constructor() {}

    intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
        const regexs: RegExp[] = [
            /playlist/,
            /playlists/,
            /ampevents/,
            /programme/,
            /schedule/,
            /tags/,
            /contentitem/,
            /search/,
            /categories/,
            /movies/,
            /draftitems/,
            /product/,
            /products/,
            /setorder/,
            /productplan/,
            /tag/,
            /installation/,
            /album/,
            /dbrefresh/,
            /populated/,
            /albums/

        ];
        if (!request.url.includes('vendor')) {
            regexs.push(/installations/);
        }
        const needsIntercept = (url: string, regexs: RegExp[]): boolean => {
            for (let regex of regexs) {
                if (url.match(regex)) {
                    return true;
                }
            }
            return false;
            // return request.url.split(/[?\/]+/).some(fragment => fragments.includes(fragment));
        };
        if (needsIntercept(request.url, regexs)) {
            return next.handle(request).pipe(
                map((event: HttpEvent<any>) => {
                    if (event instanceof HttpResponse) {
                        if (event.status === 200 && !!event.body) {
                            let bodyToParse = event.body;
                            if (typeof bodyToParse !== 'string') {
                                return event;
                            }
                            const losslessBody = parse(event.body, null, customNumberParser);
                            const newResponse = event.clone({ body: losslessBody });
                            return newResponse;
                        }
                        return event;
                    }
                    return event;
                }),
            );
        }
        return next.handle(request);
    }
}
