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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var execSync = require('child_process').execSync;
var chalk_1 = __importDefault(require("chalk"));
/**
 * Runs CLI commands
 * @param {*} command String command to run
 */
var runCommand = function (command) {
    try {
        // runs given command and prints its output to console
        execSync("".concat(command), { stdio: 'inherit' });
    }
    catch (error) {
        console.error('Failed to run command: ', error);
        return false;
    }
    return true;
};
function default_1(projectName) {
    return __awaiter(this, void 0, void 0, function () {
        var cloneGitTemplate, installDeps, cloned, depsInstalled;
        return __generator(this, function (_a) {
            cloneGitTemplate = "git clone --depth 1 https://github.com/matter-labs/zksync-hardhat-template ".concat(projectName);
            installDeps = "cd ".concat(projectName, " && yarn");
            console.log(chalk_1.default.magentaBright('Creating a zkSync - Hardhat project...'));
            console.log(chalk_1.default.magentaBright("Initialising project with name ".concat(projectName)));
            cloned = runCommand(cloneGitTemplate);
            if (!cloned)
                process.exit(-1);
            console.log(chalk_1.default.magentaBright('Installing dependencies with yarn...'));
            depsInstalled = runCommand(installDeps);
            if (!depsInstalled)
                process.exit(-1);
            console.log(chalk_1.default.magentaBright('Dependencies installed'));
            console.log("All ready! Run cd ".concat(projectName, " to enter your project folder.\n\nContracts are stored in the /contracts folder.\nDeployment scripts go in the /deploy folder.\n\nRun ").concat(chalk_1.default.magentaBright('yarn hardhat compile'), " to compile your contracts.\nRun ").concat(chalk_1.default.magentaBright('yarn hardhat deploy-zksync'), " to deploy your contract (this command accepts a --script option).\n\nRead the README file to learn more.\n\n"));
            return [2 /*return*/];
        });
    });
}
exports.default = default_1;
