import { HttpClient, HttpResponse, HttpEvent, HttpContext } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Category } from '../model/category';
import { Configuration } from '../configuration';
import { BaseService } from '../api.base.service';
import { CategoriaServiceInterface } from './categoria.serviceInterface';
import * as i0 from "@angular/core";
export declare class CategoriaService extends BaseService implements CategoriaServiceInterface {
    protected httpClient: HttpClient;
    constructor(httpClient: HttpClient, basePath: string | string[], configuration?: Configuration);
    /**
     * get de categoria por id
     * @param id
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    findById(id: number, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<Category>;
    findById(id: number, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<Category>>;
    findById(id: number, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<Category>>;
    /**
     * get all categories
     * obtiene categorias por minino de.
     * @param fuerza valor de la habilidad de fuerza
     * @param inteligencia valor de la habilidad inteligencia
     * @param destreza valor de la habilidad destreza
     * @param constitucion
     * @param sabiduria
     * @param carisma
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    findMinimo(fuerza: number, inteligencia: number, destreza: number, constitucion: number, sabiduria: number, carisma: number, observe?: 'body', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<Array<Category>>;
    findMinimo(fuerza: number, inteligencia: number, destreza: number, constitucion: number, sabiduria: number, carisma: number, observe?: 'response', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpResponse<Array<Category>>>;
    findMinimo(fuerza: number, inteligencia: number, destreza: number, constitucion: number, sabiduria: number, carisma: number, observe?: 'events', reportProgress?: boolean, options?: {
        httpHeaderAccept?: 'application/json';
        context?: HttpContext;
        transferCache?: boolean;
    }): Observable<HttpEvent<Array<Category>>>;
    static ɵfac: i0.ɵɵFactoryDeclaration<CategoriaService, [null, { optional: true; }, { optional: true; }]>;
    static ɵprov: i0.ɵɵInjectableDeclaration<CategoriaService>;
}
