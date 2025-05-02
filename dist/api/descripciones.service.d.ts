import { HttpClient, HttpResponse, HttpEvent, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Descripcion } from '../model/descripcion';
import { Configuration } from '../configuration';
import { BaseService } from '../api.base.service';
import { DescripcionesServiceInterface } from './descripciones.serviceInterface';
import * as i0 from "@angular/core";
export declare class DescripcionesService extends BaseService implements DescripcionesServiceInterface {
    protected httpClient: HttpClient;
    constructor(httpClient: HttpClient, basePath: string | string[], configuration?: Configuration);
    /**
     * @param habilidad habilidad a filtrar
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    descripcionesSearchFindByHabilidadGet(habilidad: string, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<Array<Descripcion>>;
    descripcionesSearchFindByHabilidadGet(habilidad: string, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<Array<Descripcion>>>;
    descripcionesSearchFindByHabilidadGet(habilidad: string, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<Array<Descripcion>>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<DescripcionesService, [null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<DescripcionesService>;
}
