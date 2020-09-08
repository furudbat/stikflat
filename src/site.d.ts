export const site: {
    data: {
        templates_url: string,
        templates: any
        strings: any
    }
};
export const USE_CACHE: boolean;
export function getUrlParameter(sParam: string): string
export function isOnScreen(element: JQuery<HTMLElement> | string, factor_width?: number, factor_height?: number): boolean
export function countlines(str: string): number
export function makeDoubleClick(element: JQuery<HTMLElement> | string, doDoubleClickAction: (e: any) => void, doClickAction: (e: any) => void): void