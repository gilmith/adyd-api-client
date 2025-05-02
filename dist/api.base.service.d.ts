import { HttpHeaders, HttpParams, HttpParameterCodec } from '@angular/common/http';
import { Configuration } from './configuration';
export declare class BaseService {
    protected basePath: string;
    defaultHeaders: HttpHeaders;
    configuration: Configuration;
    encoder: HttpParameterCodec;
    constructor(basePath?: string | string[], configuration?: Configuration);
    protected canConsumeForm(consumes: string[]): boolean;
    protected addToHttpParams(httpParams: HttpParams, value: any, key?: string): HttpParams;
    protected addToHttpParamsRecursive(httpParams: HttpParams, value?: any, key?: string): HttpParams;
}
