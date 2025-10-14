"use strict";
import * as application from '../application';
import { ExtensionContext, Uri } from 'vscode';
import { ContextHelpBase } from './contextHelpBase';

export class SeventyEightHundredBasicContextHelp extends ContextHelpBase {
   
    constructor() {
        super(application.SeventyEightHundredBasicLanguageId,
            "https://randomterrain.com/7800basic.html");
    }

    public async RegisterAsync(context: ExtensionContext): Promise<void> {
        // Files
        await this.LoadContextHelpFileAsync(context, '7800basic.md'); // 7800basic keywords
    }
}