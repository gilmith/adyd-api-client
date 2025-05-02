import { HttpClient, HttpResponse, HttpEvent, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Constitucion } from '../model/constitucion';
import { Configuration } from '../configuration';
import { BaseService } from '../api.base.service';
import { HabilidadesConstitucionServiceInterface } from './habilidadesConstitucion.serviceInterface';
import * as i0 from "@angular/core";
export declare class HabilidadesConstitucionService extends BaseService implements HabilidadesConstitucionServiceInterface {
    protected httpClient: HttpClient;
    constructor(httpClient: HttpClient, basePath: string | string[], configuration?: Configuration);
    /**
     * @param puntuacionBase tirada
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    habilidadesConstitucionPuntuacionBaseGet(puntuacionBase: number, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<Constitucion>;
    habilidadesConstitucionPuntuacionBaseGet(puntuacionBase: number, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<Constitucion>>;
    habilidadesConstitucionPuntuacionBaseGet(puntuacionBase: number, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<Constitucion>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<HabilidadesConstitucionService, [null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HabilidadesConstitucionService>;
}
