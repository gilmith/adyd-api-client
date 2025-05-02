import { HttpClient, HttpResponse, HttpEvent, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Alignment } from '../model/alignment';
import { Configuration } from '../configuration';
import { BaseService } from '../api.base.service';
import { AlineamientoServiceInterface } from './alineamiento.serviceInterface';
import * as i0 from "@angular/core";
export declare class AlineamientoService extends BaseService implements AlineamientoServiceInterface {
    protected httpClient: HttpClient;
    constructor(httpClient: HttpClient, basePath: string | string[], configuration?: Configuration);
    /**
     * Get all alignments.
     * obtiene todos los alineamientos.
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    findAllAlignments(observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<Array<Alignment>>;
    findAllAlignments(observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<Array<Alignment>>>;
    findAllAlignments(observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<Array<Alignment>>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<AlineamientoService, [null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<AlineamientoService>;
}
