"use strict";
import * as vscode from 'vscode';
import * as application from '../application';
import * as configuration from '../configuration';
import * as filesystem from '../filesystem';

export abstract class EmulatorBase implements vscode.Disposable {

    // Features
    public readonly Id: string;
    public readonly Name: string;
    public CustomFolderOrPath: boolean = false;
    public readonly DefaultFolderOrPath: string;
    public FolderOrPath: string = "";
    public Args: string = "";
    protected FileName: string = "";  
    protected Configuration: vscode.WorkspaceConfiguration | undefined;

    constructor(id: string, name: string, folderOrPath: string) {
        this.Id = id;
        this.Name = name;
        this.DefaultFolderOrPath = folderOrPath;
    }

    public dispose(): void {
        console.log('debugger:EmulatorBase.dispose');
    }

    public async RunGameAsync(fileName: string): Promise<boolean> {
        // Set
        this.FileName = fileName;

        // Process
        let result = await this.InitialiseAsync();
        if (!result) return false;
        return await this.ExecuteEmulatorAsync();
    }

    protected abstract ExecuteEmulatorAsync(): Promise<boolean>;
    
    protected async InitialiseAsync(): Promise<boolean> {
        console.log('debugger:EmulatorBase.InitialiseAsync');

        // Configuration
        return await this.LoadConfigurationAsync();
    }

    protected async RepairFilePermissionsAsync(): Promise<boolean> {
        return true;
    }

    protected async LoadConfigurationAsync(): Promise<boolean> {
        console.log('debugger:EmulatorBase.LoadConfigurationAsync');      

        // Reset
        this.CustomFolderOrPath = false;
        this.FolderOrPath = this.DefaultFolderOrPath;
        this.Args = "";

        // (Re)load
        // It appears you need to reload this each time incase of change
        this.Configuration = configuration.GetAtariDevStudioConfiguration();

        // Emulator
        let userEmulatorPath = this.Configuration.get<string>(`emulator.${this.Id.toLowerCase()}.path`);
        if (userEmulatorPath) {
            // Validate (user provided)
            let result = await filesystem.FileExistsAsync(userEmulatorPath);
            if (!result) {
                // Notify
                let message = `WARNING: Your chosen ${this.Name} emulator path '${userEmulatorPath}' cannot be found.\nReverting to the default emulator...`;
                application.WriteToCompilerTerminal(message);
                application.WriteToCompilerTerminal("");
                application.ShowWarningPopup(message);

                // // Notify
                // application.WriteToCompilerTerminal(`ERROR: Your chosen ${this.Name} emulator path '${userEmulatorPath}' cannot be found.`);
                // application.WriteToCompilerTerminal(`Reverting to the default emulator...`);
                // application.WriteToCompilerTerminal("");
            }
            else
            {
                // Set
                this.FolderOrPath = userEmulatorPath;
                this.CustomFolderOrPath = true;
            }

        }
        // Emulator (Other)
        this.Args = this.Configuration.get<string>(`emulator.${this.Id.toLowerCase()}.args`,""); 

        // Result
        return true;
    }
}
