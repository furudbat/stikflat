export interface ApplicationListener {
    generateHTML(): void
    generateHTMLFromTemplate(id: string | null, template: string, json: unknown, css: string, onlypreview: boolean): void
    initEditors(): void
    changeConfigMode(mode: string): void
    selectPreviewTab(): void
    selectTemplateTab(): void
    selectCssTab(): void
}