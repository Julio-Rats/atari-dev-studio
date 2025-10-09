"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HoverBase = void 0;
const vscode = require("vscode");
const path = require("path");
const filesystem = require("../filesystem");
class HoverBase {
    constructor(id) {
        this.hoverText = {};
        this.Id = id;
    }
    RegisterAsync(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // In class extension call LoadHoverFile first then super back to here
            // Complete registration
            vscode.languages.registerHoverProvider(this.Id, this);
        });
    }
    provideHover(document, position) {
        // Prepare
        const validchars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_";
        let word = '';
        let p = position.character;
        const line = String(document.lineAt(position.line).text);
        // Find beginning of the hower-word
        while (p > 0 && validchars.indexOf(line[p]) !== -1) {
            p--;
        }
        // Skip leading invalid character
        if (validchars.indexOf(line[p]) === -1) {
            p++;
        }
        // Collect string until an invalid character is encountered
        while (p < line.length && validchars.indexOf(line[p]) !== -1) {
            word += line[p++];
        }
        // Found something to check for?
        if (word) {
            // Search and validate
            let content = this.hoverText[word.toUpperCase()];
            if (content) {
                return new vscode.Hover(content);
                // 	const markdown = new vscode.MarkdownString(content);
                // 	return new vscode.Hover(markdown);
            }
        }
        // Return
        return undefined;
        //return new vscode.Hover(`No documentation found for **${word}**.`);
    }
    //
    // Load and parse a file located in .../hovers 
    //
    // The files are in markdown format with the keywords separated from the previous description
    // by three blank lines.
    //
    // Each entry in the file is appended to the hoverText[] array to be used
    // when looking up the keyword the user is hovering over
    //
    LoadHoverFileAsync(context, filename) {
        return __awaiter(this, void 0, void 0, function* () {
            // prepare
            const filePath = vscode.Uri.file(path.join(context.extensionPath, 'hovers', filename));
            const keypattern = /^([^A-Za-z0-9_]*)([A-Za-z0-9_]+)/; // Pattern for matching the 'key'
            const delimCnt = 2; // How many contiguous blank lines that must be found betwen keys
            let blanks = 0; // How many more contigous blank lines until the next key
            let key = ''; // Keyword for the popup
            let info = ''; // Collected info text for the popup
            // Interate thru the file and pick out the keywords by keeping track of
            // how many contigous blank lines that have passed by.  Since the keyword can be
            // prefixed by markdown data we need to use a regex to just get the key.
            const lines = (yield filesystem.ReadFileAsync(filePath.fsPath, 'utf-8')).toString().split(/\r?\n/);
            for (const line of lines) {
                let match = line.match(keypattern);
                // Do we something that looks like a key and also enough blanks passed by?
                if (match && match[2] && blanks <= 0) {
                    // Store if already have some lines collected
                    if (info !== '') {
                        this.hoverText[key] = info;
                    }
                    // Hold the next key, start concatenating info from scratch and reset the blank counter
                    key = match[2];
                    info = '';
                    blanks = delimCnt;
                }
                // Reset the blank lines counter to its starting value for every non-blank line encountered
                if (line.trim() === '') {
                    blanks--;
                }
                else {
                    blanks = delimCnt;
                }
                // Concat the current line into the info string
                info += line + '\r\n';
            }
            // Add eventual final key entry (happens when file is not ending with enough blank lines)
            if (info.trim() !== '') {
                this.hoverText[key] = info;
            }
        });
    }
}
exports.HoverBase = HoverBase;
//# sourceMappingURL=hoverBase.js.map