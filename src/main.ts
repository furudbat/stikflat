import './site'
import { Application } from "./application";

var initialized = false;
$(function() {
    console.log('init app ...');

    var app = new Application();
    if (!initialized) {
        app.init();
    }
    
    initialized = true;
});