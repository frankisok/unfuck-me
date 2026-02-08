import { Injectable, Injector, isDevMode } from "@angular/core";
import { LibraryConfigService } from "../../library/library-config-service";

@Injectable({
    providedIn: 'root',
})
export class Logger {
    private static injector: Injector;

    constructor(injector: Injector) {
        Logger.injector = injector;
    }

    private static get libService(): LibraryConfigService {
        return Logger.injector.get(LibraryConfigService);
    }
    static debug(message: any, color: 'blue' | 'green' | 'red' = 'blue') {
        let icon;
        let style;

        switch (color) {
            case 'green':
                icon = '🟢';
                style = "color: green; font-weight: bold;";
                break;
            case 'red':
                icon = '🔴';
                style = "color: red; font-weight: bold;";
                break;
            case 'blue':
            default:
                icon = '🔵';
                style = "color: lightblue; font-weight: bold;";
                break;
        }
        if (isDevMode() && this.libService.enableWsDebug) {
            console.debug(`%c${ icon } DEBUG: ${ message }`, style);
        }
    }

    static info(message: any) {
        if (isDevMode() && this.libService.enableWsDebug) {
            console.info("%cℹ️ INFO: " + message, "color: green; font-weight: bold;");
        }
    }

    static warn(message: any) {
        if (isDevMode() && this.libService.enableWsDebug) {
            console.warn("%c⚠️ WARNING: " + message, "color: orange; font-weight: bold;");
        }
    }

    static error(message: any) {
        if (isDevMode() && this.libService.enableWsDebug) {
            console.error("%c❌ ERROR: " + message, "color: red; font-weight: bold;");
        }
    }
}