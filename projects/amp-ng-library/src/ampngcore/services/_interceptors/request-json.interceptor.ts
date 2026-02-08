import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { stringify } from 'lossless-json';

@Injectable()
export class RequestJsonInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const URL_FRAGMENTS = [
            'playlists',
            'tags',
            'contentitem',
            'contentitems',
            'search',
            'categories',
            'movies',
            'playlist',
            'programme',
            'schedule',
            'draftitems',
            'product',
            'products',
            'setorder',
            'productplan',
            'tag',
            'installation',
            'album',
            'dbrefresh',
            'populated',
            'albums',
            'ingest',
            'replacefile'
        ];
        const needsIntercept = fragments => {
            return request.url.split('/').some(fragment => fragments.includes(fragment));
        };
        if (needsIntercept(URL_FRAGMENTS)) {
            if (request.method == 'POST' || request.method == 'PUT') {
                if (typeof request.body == 'string') {
                    return next.handle(request);
                }
                const losslessBody = stringify(request.body);
                return next.handle(request.clone({ body: losslessBody }));
            }
            return next.handle(request);
        }
        return next.handle(request);
    }
}
