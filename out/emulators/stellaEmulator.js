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
exports.StellaEmulator = void 0;
const path = require("path");
const application = require("../application");
const filesystem = require("../filesystem");
const execute = require("../execute");
const emulatorBase_1 = require("./emulatorBase");
class StellaEmulator extends emulatorBase_1.EmulatorBase {
    constructor() {
        super("Stella", "Stella", path.join(application.Path, "out", "bin", "emulators", "stella"));
        // Features
        this.AutoCloseExistingInstances = true;
    }
    LoadConfigurationAsync() {
        const _super = Object.create(null, {
            LoadConfigurationAsync: { get: () => super.LoadConfigurationAsync }
        });
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:StellaEmulator.LoadConfigurationAsync');
            // Base
            let result = yield _super.LoadConfigurationAsync.call(this);
            if (!result)
                return false;
            // Emulator
            if (!this.CustomFolderOrPath) {
                // Emulator name (depends on OS)
                var emulatorName = "Stella.exe";
                if (application.IsLinux) {
                    emulatorName = "stella";
                }
                else if (application.IsMacOS) {
                    emulatorName = "Stella.app";
                }
                // from v7 we now exclude architecture at all platforms ar x64
                this.FolderOrPath = path.join(this.FolderOrPath, application.OSPlatform, emulatorName);
            }
            // Other
            this.AutoCloseExistingInstances = this.Configuration.get(`emulator.${this.Id.toLowerCase()}.autoCloseExistingInstances`, true);
            // Result
            return true;
        });
    }
    ExecuteEmulatorAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:StellaEmulator.ExecuteEmulatorAsync');
            // Prepare
            application.WriteToCompilerTerminal('');
            // Validate for 32-bit
            if (!this.CustomFolderOrPath && application.Is32Bit) {
                application.WriteToCompilerTerminal(`ERROR: ${application.DisplayName} now only includes 64-bit (Windows, Debian Linux) or ARM M1 and 64-bit Intel (MacOS) versions of Stella (v7 onwards). If you wish to use an older 32-bit version, configure a custom path in the Settings instead (Emulator › Stella: Path).`);
                return false;
            }
            // Premissions
            yield this.RepairFilePermissionsAsync();
            // Command
            let command = `"${this.FolderOrPath}"`;
            if (application.IsMacOS)
                command = `open -a "${command}"`;
            // Args
            let args = [
                this.Args,
                `"${this.FileName}"`
            ];
            // Kill any existing process
            if (this.AutoCloseExistingInstances)
                yield execute.KillProcessByNameAsync(this.Name);
            // Process
            application.WriteToCompilerTerminal(`Launching ${this.Name} emulator...`);
            // Launch
            let executeResult = yield execute.Spawn(command, args, null, path.dirname(this.FileName), (stdout) => {
                // Prepare
                let result = true;
                // Result
                application.WriteToCompilerTerminal('' + stdout, false);
                return result;
            }, (stderr) => {
                // Prepare
                let result = true;
                // Result
                application.WriteToCompilerTerminal('' + stderr, false);
                return result;
            });
            // Result
            return executeResult;
        });
    }
    RepairFilePermissionsAsync() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('debugger:StellaEmulator.RepairFilePermissionsAsync');
            // Validate
            if (this.CustomFolderOrPath || application.IsWindows)
                return true;
            // Process
            let result = yield filesystem.ChModAsync(this.FolderOrPath);
            // Attempt to mark Stella as execute #19
            if (result && application.IsMacOS)
                result = yield filesystem.ChModAsync(path.join(this.FolderOrPath, `Contents/MacOS/Stella`));
            if (result && application.IsLinux)
                result = yield filesystem.ChModAsync(this.FolderOrPath);
            // Result
            return result;
        });
    }
}
exports.StellaEmulator = StellaEmulator;
//# sourceMappingURL=stellaEmulator.js.map