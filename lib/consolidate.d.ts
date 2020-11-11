// Type definitions for consolidate 0.14
// Project: https://github.com/visionmedia/consolidate.js
// Definitions by: Carlos Ballesteros Velasco <https://github.com/soywiz>
//                 Theo Sherry <https://github.com/theosherry>
//                 Nicolas Henry <https://github.com/nicolashenry>
//                 Andrew Leedham <https://github.com/AndrewLeedham>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 3.2

// Imported from: https://github.com/soywiz/typescript-node-definitions/consolidate.d.ts

declare var cons: Consolidate;

export = cons;

type SupportedTemplateEngines =
    | 'atpl'
    | 'bracket'
    | 'dot'
    | 'eco'
    | 'ejs'
    | 'ect'
    | 'haml'
    | 'hamlet'
    | 'handlebars'
    | 'hogan'
    | 'jade'
    | 'jazz'
    | 'jqtpl'
    | 'just'
    | 'liquor'
    | 'lodash'
    | 'mote'
    | 'mustache'
    | 'plates'
    | 'pug'
    | 'qejs'
    | 'slm'
    | 'squirrelly'
    | 'swig'
    | 'templayed'
    | 'underscore'
    | 'vash'
    | 'velocityjs'
    | 'whiskers';

type Requires = SupportedTemplateEngines | 'extend' | 'ReactDOM' | 'babel';

type ConsolidateType = {
    [engine in SupportedTemplateEngines]: RendererInterface;
}

type RequiresType = {
    [engine in Requires]: any;
}

interface Consolidate extends ConsolidateType {
    /**
     * expose the instance of the engine
     */
    requires: RequiresType;

    /**
     * Clear the cache.
     *
     * @api public
     */
    clearCache(): void;
}

interface RendererInterface {
    render(str: string, fn: (err: Error, html: string) => any): any;

    render(str: string, options: { _cache?: boolean, [otherOptions: string]: any }, fn: (err: Error, html: string) => any): any;

    render(str: string, options?: { _cache?: boolean, [otherOptions: string]: any }): Promise<string>;

    (str: string, fn: (err: Error, html: string) => any): any;

    (str: string, options: { _cache?: boolean, [otherOptions: string]: any }, fn: (err: Error, html: string) => any): any;

    (str: string, options?: { _cache?: boolean, [otherOptions: string]: any }): Promise<string>;
}