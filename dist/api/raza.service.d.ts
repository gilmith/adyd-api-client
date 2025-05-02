import { HttpClient, HttpResponse, HttpEvent, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Raza } from '../model/raza';
import { Configuration } from '../configuration';
import { BaseService } from '../api.base.service';
import { RazaServiceInterface } from './raza.serviceInterface';
import * as i0 from "@angular/core";
export declare class RazaService extends BaseService implements RazaServiceInterface {
    protected httpClient: HttpClient;
    constructor(httpClient: HttpClient, basePath: string | string[], configuration?: Configuration);
    /**
     * get razas por puntuacion.
     * find razas disponbles por tirada de datos.
     * @param fuerza tirada de fuerza
     * @param destreza tirada de destreza
     * @param constitucion
     * @param inteligencia
     * @param sabiduria
     * @param carisma
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    findRazaMinimo(fuerza: number, destreza: number, constitucion: number, inteligencia: number, sabiduria: number, carisma: number, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<Array<Raza>>;
    findRazaMinimo(fuerza: number, destreza: number, constitucion: number, inteligencia: number, sabiduria: number, carisma: number, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<Array<Raza>>>;
    findRazaMinimo(fuerza: number, destreza: number, constitucion: number, inteligencia: number, sabiduria: number, carisma: number, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<Array<Raza>>>;
    /**
     * Find raza by ID.
     * Returns a single raza.
     * @param id ID of pet to return
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    getRazaById(id: number, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<Raza>;
    getRazaById(id: number, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<Raza>>;
    getRazaById(id: number, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<Raza>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<RazaService, [null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<RazaService>;
}
