import { HttpClient, HttpResponse, HttpEvent, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Fuerza } from '../model/fuerza';
import { Configuration } from '../configuration';
import { BaseService } from '../api.base.service';
import { HabilidadesFuerzaServiceInterface } from './habilidadesFuerza.serviceInterface';
import * as i0 from "@angular/core";
export declare class HabilidadesFuerzaService extends BaseService implements HabilidadesFuerzaServiceInterface {
    protected httpClient: HttpClient;
    constructor(httpClient: HttpClient, basePath: string | string[], configuration?: Configuration);
    /**
     * @param puntuacionBase tirada
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    habilidadesFuerzaPuntuacionBaseGet(puntuacionBase: number, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<Fuerza>;
    habilidadesFuerzaPuntuacionBaseGet(puntuacionBase: number, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<Fuerza>>;
    habilidadesFuerzaPuntuacionBaseGet(puntuacionBase: number, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<Fuerza>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<HabilidadesFuerzaService, [null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HabilidadesFuerzaService>;
}
