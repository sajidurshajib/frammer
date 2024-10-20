"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
function activate(context) {
    console.log('Congratulations, your extension "frammer" is now active!');
    const disposable = vscode.commands.registerCommand('frammer.starter', () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            vscode.window.showErrorMessage('No workspace folder is open.');
            return;
        }
        const projectDir = workspaceFolders[0].uri.fsPath;
        const structureFilePath = path.join(projectDir, 'structure.json');
        if (!fs.existsSync(structureFilePath)) {
            vscode.window.showInformationMessage('The structure.json file is not found in the project directory.');
        }
        else {
            vscode.window
                .showInformationMessage('Make project structure using frammer!', 'Yes', 'No')
                .then((selection) => {
                if (selection === 'Yes') {
                    createProjectStructure(projectDir, structureFilePath);
                }
                else if (selection === 'No') {
                    return;
                }
            });
        }
    });
    context.subscriptions.push(disposable);
}
function createProjectStructure(projectDir, structureFilePath) {
    const structure = JSON.parse(fs.readFileSync(structureFilePath, 'utf-8'));
    if (structure.dir && Array.isArray(structure.dir)) {
        structure.dir.forEach((dirPath) => {
            createDirectory(projectDir, dirPath);
        });
    }
    else {
        vscode.window.showErrorMessage('Invalid structure in structure.json file.');
    }
}
function createDirectory(projectDir, fullPath) {
    const pathParts = fullPath.split(path.sep); // Split the path into parts using the OS-appropriate separator
    let currentPath = projectDir; // This will hold the path as we build it
    // Loop through all the parts of the path
    for (const part of pathParts) {
        currentPath = path.join(currentPath, part); // Build the path part by part
        // Check if the current directory exists
        if (!fs.existsSync(currentPath)) {
            // If the directory doesn't exist, create it
            fs.mkdirSync(currentPath);
            vscode.window.showInformationMessage(`Directory "${currentPath}" created successfully!`);
        }
        else {
            vscode.window.showInformationMessage(`Directory "${currentPath}" already exists.`);
        }
    }
}
function deactivate() { }
//# sourceMappingURL=temp.js.map