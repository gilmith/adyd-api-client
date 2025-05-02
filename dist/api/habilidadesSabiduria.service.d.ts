import { HttpClient, HttpResponse, HttpEvent, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Sabiduria } from '../model/sabiduria';
import { Configuration } from '../configuration';
import { BaseService } from '../api.base.service';
import { HabilidadesSabiduriaServiceInterface } from './habilidadesSabiduria.serviceInterface';
import * as i0 from "@angular/core";
export declare class HabilidadesSabiduriaService extends BaseService implements HabilidadesSabiduriaServiceInterface {
    protected httpClient: HttpClient;
    constructor(httpClient: HttpClient, basePath: string | string[], configuration?: Configuration);
    /**
     * @param puntuacionBase tirada
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    habilidadesSabiduriaPuntuacionBaseGet(puntuacionBase: number, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<Sabiduria>;
    habilidadesSabiduriaPuntuacionBaseGet(puntuacionBase: number, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<Sabiduria>>;
    habilidadesSabiduriaPuntuacionBaseGet(puntuacionBase: number, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<Sabiduria>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<HabilidadesSabiduriaService, [null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HabilidadesSabiduriaService>;
}
