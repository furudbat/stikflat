export const site: {
    data: {
        templates_url: string,
        templates: any
        strings: any
    }
};
export const USE_CACHE: boolean;
export function getUrlParameter(sParam: string): string
export function isOnScreen(element: HTMLElement, factor_width: number, factor_height: number): boolean
export function countlines(str: string): number
export function makeDoubleClick(element: HTMLElement, doDoubleClickAction: (e: any) => void, doClickAction: (e: any) => void): void