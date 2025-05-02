import * as i0 from '@angular/core';
import { InjectionToken, Optional, Inject, Injectable, SkipSelf, NgModule } from '@angular/core';
import * as i1 from '@angular/common/http';
import { HttpHeaders, HttpContext, HttpParams } from '@angular/common/http';

const BASE_PATH = new InjectionToken('basePath');
const COLLECTION_FORMATS = {
    'csv': ',',
    'tsv': '   ',
    'ssv': ' ',
    'pipes': '|'
};

/**
 * Custom HttpParameterCodec
 * Workaround for https://github.com/angular/angular/issues/18261
 */
class CustomHttpParameterCodec {
    encodeKey(k) {
        return encodeURIComponent(k);
    }
    encodeValue(v) {
        return encodeURIComponent(v);
    }
    decodeKey(k) {
        return decodeURIComponent(k);
    }
    decodeValue(v) {
        return decodeURIComponent(v);
    }
}

class Configuration {
    /**
     *  @deprecated Since 5.0. Use credentials instead
     */
    apiKeys;
    username;
    password;
    /**
     *  @deprecated Since 5.0. Use credentials instead
     */
    accessToken;
    basePath;
    withCredentials;
    /**
     * Takes care of encoding query- and form-parameters.
     */
    encoder;
    /**
     * Encoding of various path parameter
     * <a href="https://github.com/OAI/OpenAPI-Specification/blob/main/versions/3.1.0.md#style-values">styles</a>.
     * <p>
     * See {@link README.md} for more details
     * </p>
     */
    encodeParam;
    /**
     * The keys are the names in the securitySchemes section of the OpenAPI
     * document. They should map to the value used for authentication
     * minus any standard prefixes such as 'Basic' or 'Bearer'.
     */
    credentials;
    constructor(configurationParameters = {}) {
        this.apiKeys = configurationParameters.apiKeys;
        this.username = configurationParameters.username;
        this.password = configurationParameters.password;
        this.accessToken = configurationParameters.accessToken;
        this.basePath = configurationParameters.basePath;
        this.withCredentials = configurationParameters.withCredentials;
        this.encoder = configurationParameters.encoder;
        if (configurationParameters.encodeParam) {
            this.encodeParam = configurationParameters.encodeParam;
        }
        else {
            this.encodeParam = param => this.defaultEncodeParam(param);
        }
        if (configurationParameters.credentials) {
            this.credentials = configurationParameters.credentials;
        }
        else {
            this.credentials = {};
        }
    }
    /**
     * Select the correct content-type to use for a request.
     * Uses {@link Configuration#isJsonMime} to determine the correct content-type.
     * If no content type is found return the first found type if the contentTypes is not empty
     * @param contentTypes - the array of content types that are available for selection
     * @returns the selected content-type or <code>undefined</code> if no selection could be made.
     */
    selectHeaderContentType(contentTypes) {
        if (contentTypes.length === 0) {
            return undefined;
        }
        const type = contentTypes.find((x) => this.isJsonMime(x));
        if (type === undefined) {
            return contentTypes[0];
        }
        return type;
    }
    /**
     * Select the correct accept content-type to use for a request.
     * Uses {@link Configuration#isJsonMime} to determine the correct accept content-type.
     * If no content type is found return the first found type if the contentTypes is not empty
     * @param accepts - the array of content types that are available for selection.
     * @returns the selected content-type or <code>undefined</code> if no selection could be made.
     */
    selectHeaderAccept(accepts) {
        if (accepts.length === 0) {
            return undefined;
        }
        const type = accepts.find((x) => this.isJsonMime(x));
        if (type === undefined) {
            return accepts[0];
        }
        return type;
    }
    /**
     * Check if the given MIME is a JSON MIME.
     * JSON MIME examples:
     *   application/json
     *   application/json; charset=UTF8
     *   APPLICATION/JSON
     *   application/vnd.company+json
     * @param mime - MIME (Multipurpose Internet Mail Extensions)
     * @return True if the given MIME is JSON, false otherwise.
     */
    isJsonMime(mime) {
        const jsonMime = new RegExp('^(application\/json|[^;/ \t]+\/[^;/ \t]+[+]json)[ \t]*(;.*)?$', 'i');
        return mime !== null && (jsonMime.test(mime) || mime.toLowerCase() === 'application/json-patch+json');
    }
    lookupCredential(key) {
        const value = this.credentials[key];
        return typeof value === 'function'
            ? value()
            : value;
    }
    addCredentialToHeaders(credentialKey, headerName, headers, prefix) {
        const value = this.lookupCredential(credentialKey);
        return value
            ? headers.set(headerName, (prefix ?? '') + value)
            : headers;
    }
    addCredentialToQuery(credentialKey, paramName, query) {
        const value = this.lookupCredential(credentialKey);
        return value
            ? query.set(paramName, value)
            : query;
    }
    defaultEncodeParam(param) {
        // This implementation exists as fallback for missing configuration
        // and for backwards compatibility to older typescript-angular generator versions.
        // It only works for the 'simple' parameter style.
        // Date-handling only works for the 'date-time' format.
        // All other styles and Date-formats are probably handled incorrectly.
        //
        // But: if that's all you need (i.e.: the most common use-case): no need for customization!
        const value = param.dataFormat === 'date-time' && param.value instanceof Date
            ? param.value.toISOString()
            : param.value;
        return encodeURIComponent(String(value));
    }
}

class BaseService {
    basePath = '';
    defaultHeaders = new HttpHeaders();
    configuration;
    encoder;
    constructor(basePath, configuration) {
        this.configuration = configuration || new Configuration();
        if (typeof this.configuration.basePath !== 'string') {
            const firstBasePath = Array.isArray(basePath) ? basePath[0] : undefined;
            if (firstBasePath != undefined) {
                basePath = firstBasePath;
            }
            if (typeof basePath !== 'string') {
                basePath = this.basePath;
            }
            this.configuration.basePath = basePath;
        }
        this.encoder = this.configuration.encoder || new CustomHttpParameterCodec();
    }
    canConsumeForm(consumes) {
        return consumes.indexOf('multipart/form-data') !== -1;
    }
    addToHttpParams(httpParams, value, key) {
        // If the value is an object (but not a Date), recursively add its keys.
        if (typeof value === 'object' && !(value instanceof Date)) {
            return this.addToHttpParamsRecursive(httpParams, value, key);
        }
        return this.addToHttpParamsRecursive(httpParams, value, key);
    }
    addToHttpParamsRecursive(httpParams, value, key) {
        if (value === null || value === undefined) {
            return httpParams;
        }
        if (typeof value === 'object') {
            // If JSON format is preferred, key must be provided.
            if (key != null) {
                return httpParams.append(key, JSON.stringify(value));
            }
            // Otherwise, if it's an array, add each element.
            if (Array.isArray(value)) {
                value.forEach(elem => httpParams = this.addToHttpParamsRecursive(httpParams, elem, key));
            }
            else if (value instanceof Date) {
                if (key != null) {
                    httpParams = httpParams.append(key, value.toISOString());
                }
                else {
                    throw Error("key may not be null if value is Date");
                }
            }
            else {
                Object.keys(value).forEach(k => {
                    const paramKey = key ? `${key}.${k}` : k;
                    httpParams = this.addToHttpParamsRecursive(httpParams, value[k], paramKey);
                });
            }
            return httpParams;
        }
        else if (key != null) {
            return httpParams.append(key, value);
        }
        throw Error("key may not be null if value is not object or array");
    }
}

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class AlineamientoService extends BaseService {
    httpClient;
    constructor(httpClient, basePath, configuration) {
        super(basePath, configuration);
        this.httpClient = httpClient;
    }
    findAllAlignments(observe = 'body', reportProgress = false, options) {
        let localVarHeaders = this.defaultHeaders;
        const localVarHttpHeaderAcceptSelected = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        const localVarHttpContext = options?.context ?? new HttpContext();
        const localVarTransferCache = options?.transferCache ?? true;
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/alineamiento`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: AlineamientoService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: Configuration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: AlineamientoService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: AlineamientoService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: Configuration, decorators: [{
                    type: Optional
                }] }] });

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class CategoriaService extends BaseService {
    httpClient;
    constructor(httpClient, basePath, configuration) {
        super(basePath, configuration);
        this.httpClient = httpClient;
    }
    findById(id, observe = 'body', reportProgress = false, options) {
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling findById.');
        }
        let localVarHeaders = this.defaultHeaders;
        const localVarHttpHeaderAcceptSelected = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        const localVarHttpContext = options?.context ?? new HttpContext();
        const localVarTransferCache = options?.transferCache ?? true;
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/categoria/${this.configuration.encodeParam({ name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "number", dataFormat: undefined })}`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    findMinimo(fuerza, inteligencia, destreza, constitucion, sabiduria, carisma, observe = 'body', reportProgress = false, options) {
        if (fuerza === null || fuerza === undefined) {
            throw new Error('Required parameter fuerza was null or undefined when calling findMinimo.');
        }
        if (inteligencia === null || inteligencia === undefined) {
            throw new Error('Required parameter inteligencia was null or undefined when calling findMinimo.');
        }
        if (destreza === null || destreza === undefined) {
            throw new Error('Required parameter destreza was null or undefined when calling findMinimo.');
        }
        if (constitucion === null || constitucion === undefined) {
            throw new Error('Required parameter constitucion was null or undefined when calling findMinimo.');
        }
        if (sabiduria === null || sabiduria === undefined) {
            throw new Error('Required parameter sabiduria was null or undefined when calling findMinimo.');
        }
        if (carisma === null || carisma === undefined) {
            throw new Error('Required parameter carisma was null or undefined when calling findMinimo.');
        }
        let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
        localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, fuerza, 'fuerza');
        localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, inteligencia, 'inteligencia');
        localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, destreza, 'destreza');
        localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, constitucion, 'constitucion');
        localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, sabiduria, 'sabiduria');
        localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, carisma, 'carisma');
        let localVarHeaders = this.defaultHeaders;
        const localVarHttpHeaderAcceptSelected = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        const localVarHttpContext = options?.context ?? new HttpContext();
        const localVarTransferCache = options?.transferCache ?? true;
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/categoria/search/findMinimo`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            params: localVarQueryParameters,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: CategoriaService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: Configuration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: CategoriaService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: CategoriaService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: Configuration, decorators: [{
                    type: Optional
                }] }] });

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class DescripcionesService extends BaseService {
    httpClient;
    constructor(httpClient, basePath, configuration) {
        super(basePath, configuration);
        this.httpClient = httpClient;
    }
    descripcionesSearchFindByHabilidadGet(habilidad, observe = 'body', reportProgress = false, options) {
        if (habilidad === null || habilidad === undefined) {
            throw new Error('Required parameter habilidad was null or undefined when calling descripcionesSearchFindByHabilidadGet.');
        }
        let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
        localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, habilidad, 'habilidad');
        let localVarHeaders = this.defaultHeaders;
        const localVarHttpHeaderAcceptSelected = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        const localVarHttpContext = options?.context ?? new HttpContext();
        const localVarTransferCache = options?.transferCache ?? true;
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/descripciones/search/findByHabilidad`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            params: localVarQueryParameters,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: DescripcionesService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: Configuration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: DescripcionesService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: DescripcionesService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: Configuration, decorators: [{
                    type: Optional
                }] }] });

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class HabilidadesCarismaService extends BaseService {
    httpClient;
    constructor(httpClient, basePath, configuration) {
        super(basePath, configuration);
        this.httpClient = httpClient;
    }
    habilidadesCarismaPuntuacionBaseGet(puntuacionBase, observe = 'body', reportProgress = false, options) {
        if (puntuacionBase === null || puntuacionBase === undefined) {
            throw new Error('Required parameter puntuacionBase was null or undefined when calling habilidadesCarismaPuntuacionBaseGet.');
        }
        let localVarHeaders = this.defaultHeaders;
        const localVarHttpHeaderAcceptSelected = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        const localVarHttpContext = options?.context ?? new HttpContext();
        const localVarTransferCache = options?.transferCache ?? true;
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/habilidadesCarisma/${this.configuration.encodeParam({ name: "puntuacionBase", value: puntuacionBase, in: "path", style: "simple", explode: false, dataType: "number", dataFormat: undefined })}`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesCarismaService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: Configuration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesCarismaService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesCarismaService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: Configuration, decorators: [{
                    type: Optional
                }] }] });

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class HabilidadesConstitucionService extends BaseService {
    httpClient;
    constructor(httpClient, basePath, configuration) {
        super(basePath, configuration);
        this.httpClient = httpClient;
    }
    habilidadesConstitucionPuntuacionBaseGet(puntuacionBase, observe = 'body', reportProgress = false, options) {
        if (puntuacionBase === null || puntuacionBase === undefined) {
            throw new Error('Required parameter puntuacionBase was null or undefined when calling habilidadesConstitucionPuntuacionBaseGet.');
        }
        let localVarHeaders = this.defaultHeaders;
        const localVarHttpHeaderAcceptSelected = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        const localVarHttpContext = options?.context ?? new HttpContext();
        const localVarTransferCache = options?.transferCache ?? true;
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/habilidadesConstitucion/${this.configuration.encodeParam({ name: "puntuacionBase", value: puntuacionBase, in: "path", style: "simple", explode: false, dataType: "number", dataFormat: undefined })}`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesConstitucionService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: Configuration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesConstitucionService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesConstitucionService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: Configuration, decorators: [{
                    type: Optional
                }] }] });

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class HabilidadesDestrezaService extends BaseService {
    httpClient;
    constructor(httpClient, basePath, configuration) {
        super(basePath, configuration);
        this.httpClient = httpClient;
    }
    habilidadesDestrezaPuntuacionBaseGet(puntuacionBase, observe = 'body', reportProgress = false, options) {
        if (puntuacionBase === null || puntuacionBase === undefined) {
            throw new Error('Required parameter puntuacionBase was null or undefined when calling habilidadesDestrezaPuntuacionBaseGet.');
        }
        let localVarHeaders = this.defaultHeaders;
        const localVarHttpHeaderAcceptSelected = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        const localVarHttpContext = options?.context ?? new HttpContext();
        const localVarTransferCache = options?.transferCache ?? true;
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/habilidadesDestreza/${this.configuration.encodeParam({ name: "puntuacionBase", value: puntuacionBase, in: "path", style: "simple", explode: false, dataType: "number", dataFormat: undefined })}`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesDestrezaService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: Configuration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesDestrezaService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesDestrezaService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: Configuration, decorators: [{
                    type: Optional
                }] }] });

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class HabilidadesFuerzaService extends BaseService {
    httpClient;
    constructor(httpClient, basePath, configuration) {
        super(basePath, configuration);
        this.httpClient = httpClient;
    }
    habilidadesFuerzaPuntuacionBaseGet(puntuacionBase, observe = 'body', reportProgress = false, options) {
        if (puntuacionBase === null || puntuacionBase === undefined) {
            throw new Error('Required parameter puntuacionBase was null or undefined when calling habilidadesFuerzaPuntuacionBaseGet.');
        }
        let localVarHeaders = this.defaultHeaders;
        const localVarHttpHeaderAcceptSelected = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        const localVarHttpContext = options?.context ?? new HttpContext();
        const localVarTransferCache = options?.transferCache ?? true;
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/habilidadesFuerza/${this.configuration.encodeParam({ name: "puntuacionBase", value: puntuacionBase, in: "path", style: "simple", explode: false, dataType: "number", dataFormat: undefined })}`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesFuerzaService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: Configuration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesFuerzaService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesFuerzaService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: Configuration, decorators: [{
                    type: Optional
                }] }] });

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class HabilidadesInteligenciaService extends BaseService {
    httpClient;
    constructor(httpClient, basePath, configuration) {
        super(basePath, configuration);
        this.httpClient = httpClient;
    }
    habilidadesInteligenciaPuntuacionBaseGet(puntuacionBase, observe = 'body', reportProgress = false, options) {
        if (puntuacionBase === null || puntuacionBase === undefined) {
            throw new Error('Required parameter puntuacionBase was null or undefined when calling habilidadesInteligenciaPuntuacionBaseGet.');
        }
        let localVarHeaders = this.defaultHeaders;
        const localVarHttpHeaderAcceptSelected = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        const localVarHttpContext = options?.context ?? new HttpContext();
        const localVarTransferCache = options?.transferCache ?? true;
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/habilidadesInteligencia/${this.configuration.encodeParam({ name: "puntuacionBase", value: puntuacionBase, in: "path", style: "simple", explode: false, dataType: "number", dataFormat: undefined })}`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesInteligenciaService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: Configuration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesInteligenciaService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesInteligenciaService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: Configuration, decorators: [{
                    type: Optional
                }] }] });

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class HabilidadesSabiduriaService extends BaseService {
    httpClient;
    constructor(httpClient, basePath, configuration) {
        super(basePath, configuration);
        this.httpClient = httpClient;
    }
    habilidadesSabiduriaPuntuacionBaseGet(puntuacionBase, observe = 'body', reportProgress = false, options) {
        if (puntuacionBase === null || puntuacionBase === undefined) {
            throw new Error('Required parameter puntuacionBase was null or undefined when calling habilidadesSabiduriaPuntuacionBaseGet.');
        }
        let localVarHeaders = this.defaultHeaders;
        const localVarHttpHeaderAcceptSelected = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        const localVarHttpContext = options?.context ?? new HttpContext();
        const localVarTransferCache = options?.transferCache ?? true;
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/habilidadesSabiduria/${this.configuration.encodeParam({ name: "puntuacionBase", value: puntuacionBase, in: "path", style: "simple", explode: false, dataType: "number", dataFormat: undefined })}`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesSabiduriaService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: Configuration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesSabiduriaService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: HabilidadesSabiduriaService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: Configuration, decorators: [{
                    type: Optional
                }] }] });

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */
class RazaService extends BaseService {
    httpClient;
    constructor(httpClient, basePath, configuration) {
        super(basePath, configuration);
        this.httpClient = httpClient;
    }
    findRazaMinimo(fuerza, destreza, constitucion, inteligencia, sabiduria, carisma, observe = 'body', reportProgress = false, options) {
        if (fuerza === null || fuerza === undefined) {
            throw new Error('Required parameter fuerza was null or undefined when calling findRazaMinimo.');
        }
        if (destreza === null || destreza === undefined) {
            throw new Error('Required parameter destreza was null or undefined when calling findRazaMinimo.');
        }
        if (constitucion === null || constitucion === undefined) {
            throw new Error('Required parameter constitucion was null or undefined when calling findRazaMinimo.');
        }
        if (inteligencia === null || inteligencia === undefined) {
            throw new Error('Required parameter inteligencia was null or undefined when calling findRazaMinimo.');
        }
        if (sabiduria === null || sabiduria === undefined) {
            throw new Error('Required parameter sabiduria was null or undefined when calling findRazaMinimo.');
        }
        if (carisma === null || carisma === undefined) {
            throw new Error('Required parameter carisma was null or undefined when calling findRazaMinimo.');
        }
        let localVarQueryParameters = new HttpParams({ encoder: this.encoder });
        localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, fuerza, 'fuerza');
        localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, destreza, 'destreza');
        localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, constitucion, 'constitucion');
        localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, inteligencia, 'inteligencia');
        localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, sabiduria, 'sabiduria');
        localVarQueryParameters = this.addToHttpParams(localVarQueryParameters, carisma, 'carisma');
        let localVarHeaders = this.defaultHeaders;
        const localVarHttpHeaderAcceptSelected = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        const localVarHttpContext = options?.context ?? new HttpContext();
        const localVarTransferCache = options?.transferCache ?? true;
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/raza/search/findMinimo`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            params: localVarQueryParameters,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    getRazaById(id, observe = 'body', reportProgress = false, options) {
        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling getRazaById.');
        }
        let localVarHeaders = this.defaultHeaders;
        const localVarHttpHeaderAcceptSelected = options?.httpHeaderAccept ?? this.configuration.selectHeaderAccept([
            'application/json'
        ]);
        if (localVarHttpHeaderAcceptSelected !== undefined) {
            localVarHeaders = localVarHeaders.set('Accept', localVarHttpHeaderAcceptSelected);
        }
        const localVarHttpContext = options?.context ?? new HttpContext();
        const localVarTransferCache = options?.transferCache ?? true;
        let responseType_ = 'json';
        if (localVarHttpHeaderAcceptSelected) {
            if (localVarHttpHeaderAcceptSelected.startsWith('text')) {
                responseType_ = 'text';
            }
            else if (this.configuration.isJsonMime(localVarHttpHeaderAcceptSelected)) {
                responseType_ = 'json';
            }
            else {
                responseType_ = 'blob';
            }
        }
        let localVarPath = `/raza/${this.configuration.encodeParam({ name: "id", value: id, in: "path", style: "simple", explode: false, dataType: "number", dataFormat: undefined })}`;
        return this.httpClient.request('get', `${this.configuration.basePath}${localVarPath}`, {
            context: localVarHttpContext,
            responseType: responseType_,
            withCredentials: this.configuration.withCredentials,
            headers: localVarHeaders,
            observe: observe,
            transferCache: localVarTransferCache,
            reportProgress: reportProgress
        });
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: RazaService, deps: [{ token: i1.HttpClient }, { token: BASE_PATH, optional: true }, { token: Configuration, optional: true }], target: i0.ɵɵFactoryTarget.Injectable });
    static ɵprov = i0.ɵɵngDeclareInjectable({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: RazaService, providedIn: 'root' });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: RazaService, decorators: [{
            type: Injectable,
            args: [{
                    providedIn: 'root'
                }]
        }], ctorParameters: () => [{ type: i1.HttpClient }, { type: undefined, decorators: [{
                    type: Optional
                }, {
                    type: Inject,
                    args: [BASE_PATH]
                }] }, { type: Configuration, decorators: [{
                    type: Optional
                }] }] });

const APIS = [AlineamientoService, CategoriaService, DescripcionesService, HabilidadesCarismaService, HabilidadesConstitucionService, HabilidadesDestrezaService, HabilidadesFuerzaService, HabilidadesInteligenciaService, HabilidadesSabiduriaService, RazaService];

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

/**
 * adyd spring data rest
 *
 * Contact: gilmith@gmail.com
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

class ApiModule {
    static forRoot(configurationFactory) {
        return {
            ngModule: ApiModule,
            providers: [{ provide: Configuration, useFactory: configurationFactory }]
        };
    }
    constructor(parentModule, http) {
        if (parentModule) {
            throw new Error('ApiModule is already loaded. Import in your base AppModule only.');
        }
        if (!http) {
            throw new Error('You need to import the HttpClientModule in your AppModule! \n' +
                'See also https://github.com/angular/angular/issues/20575');
        }
    }
    static ɵfac = i0.ɵɵngDeclareFactory({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: ApiModule, deps: [{ token: ApiModule, optional: true, skipSelf: true }, { token: i1.HttpClient, optional: true }], target: i0.ɵɵFactoryTarget.NgModule });
    static ɵmod = i0.ɵɵngDeclareNgModule({ minVersion: "14.0.0", version: "19.2.6", ngImport: i0, type: ApiModule });
    static ɵinj = i0.ɵɵngDeclareInjector({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: ApiModule });
}
i0.ɵɵngDeclareClassMetadata({ minVersion: "12.0.0", version: "19.2.6", ngImport: i0, type: ApiModule, decorators: [{
            type: NgModule,
            args: [{
                    imports: [],
                    declarations: [],
                    exports: [],
                    providers: []
                }]
        }], ctorParameters: () => [{ type: ApiModule, decorators: [{
                    type: Optional
                }, {
                    type: SkipSelf
                }] }, { type: i1.HttpClient, decorators: [{
                    type: Optional
                }] }] });

/**
 * Generated bundle index. Do not edit.
 */

export { APIS, AlineamientoService, ApiModule, BASE_PATH, COLLECTION_FORMATS, CategoriaService, Configuration, DescripcionesService, HabilidadesCarismaService, HabilidadesConstitucionService, HabilidadesDestrezaService, HabilidadesFuerzaService, HabilidadesInteligenciaService, HabilidadesSabiduriaService, RazaService };
//# sourceMappingURL=gilmith-adyd-api-client.mjs.map
