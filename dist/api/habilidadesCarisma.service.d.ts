import { HttpClient, HttpResponse, HttpEvent, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Carisma } from '../model/carisma';
import { Configuration } from '../configuration';
import { BaseService } from '../api.base.service';
import { HabilidadesCarismaServiceInterface } from './habilidadesCarisma.serviceInterface';
import * as i0 from "@angular/core";
export declare class HabilidadesCarismaService extends BaseService implements HabilidadesCarismaServiceInterface {
    protected httpClient: HttpClient;
    constructor(httpClient: HttpClient, basePath: string | string[], configuration?: Configuration);
    /**
     * @param puntuacionBase tirada
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    habilidadesCarismaPuntuacionBaseGet(puntuacionBase: number, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<Carisma>;
    habilidadesCarismaPuntuacionBaseGet(puntuacionBase: number, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<Carisma>>;
    habilidadesCarismaPuntuacionBaseGet(puntuacionBase: number, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<Carisma>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<HabilidadesCarismaService, [null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<HabilidadesCarismaService>;
}
