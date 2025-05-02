import { HttpClient, HttpResponse, HttpEvent, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Destreza } from '../model/destreza';
import { Configuration } from '../configuration';
import { BaseService } from '../api.base.service';
import { HabilidadesDestrezaServiceInterface } from './habilidadesDestreza.serviceInterface';
import * as i0 from "@angular/core";
export declare class HabilidadesDestrezaService extends BaseService implements HabilidadesDestrezaServiceInterface {
    protected httpClient: HttpClient;
    constructor(httpClient: HttpClient, basePath: string | string[], configuration?: Configuration);
    /**
     * @param puntuacionBase tirada
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    habilidadesDestrezaPuntuacionBaseGet(puntuacionBase: number, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<Destreza>;
    habilidadesDestrezaPuntuacionBaseGet(puntuacionBase: number, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<Destreza>>;
    habilidadesDestrezaPuntuacionBaseGet(puntuacionBase: number, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<Destreza>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<HabilidadesDestrezaService, [null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HabilidadesDestrezaService>;
}
