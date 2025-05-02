import { HttpClient, HttpResponse, HttpEvent, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Inteligencia } from '../model/inteligencia';
import { Configuration } from '../configuration';
import { BaseService } from '../api.base.service';
import { HabilidadesInteligenciaServiceInterface } from './habilidadesInteligencia.serviceInterface';
import * as i0 from "@angular/core";
export declare class HabilidadesInteligenciaService extends BaseService implements HabilidadesInteligenciaServiceInterface {
    protected httpClient: HttpClient;
    constructor(httpClient: HttpClient, basePath: string | string[], configuration?: Configuration);
    /**
     * @param puntuacionBase tirada
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    habilidadesInteligenciaPuntuacionBaseGet(puntuacionBase: number, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<Inteligencia>;
    habilidadesInteligenciaPuntuacionBaseGet(puntuacionBase: number, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<Inteligencia>>;
    habilidadesInteligenciaPuntuacionBaseGet(puntuacionBase: number, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<Inteligencia>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<HabilidadesInteligenciaService, [null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HabilidadesInteligenciaService>;
}
