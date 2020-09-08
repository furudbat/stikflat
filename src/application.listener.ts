export interface ApplicationListener {
    generateHTML(): void
    generateHTMLFromTemplate(template_engine: string, template: string, json: any, css: string, onlypreview: boolean): void
    initEditors(): void
    changeConfigMode(mode: string): void
    selectPreviewTab(): void
    selectTemplateTab(): void
    selectCssTab(): void
}