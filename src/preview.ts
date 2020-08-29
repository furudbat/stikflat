import { site } from './site'
import { ApplicationData } from './application.data'

export class Preview {
    private _appData: ApplicationData;

    constructor(appData: ApplicationData){
        this._appData = appData;
    }

    enableLivePreview() {
        this._appData.enableLivePreview();
        $('#chbLivePreviewHelp').html(site.data.strings.editor.template.enabled_live_preview_help);
    }
    disableLivePreview() {
        this._appData.disableLivePreview();
        $('#chbLivePreviewHelp').html(site.data.strings.editor.template.disabled_live_preview_help);
    }

    setHTMLPreview(htmlstr: string, css: string) {
        const html: any = $.parseHTML('<style>' + css + '</style>' + htmlstr);
        $('#preview-html').html(html);
    }
}