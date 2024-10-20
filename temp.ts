



import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
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
        } else {
            vscode.window
                .showInformationMessage('Make project structure using frammer!', 'Yes', 'No')
                .then((selection) => {
                    if (selection === 'Yes') {
                        createProjectStructure(projectDir, structureFilePath);
                    } else if (selection === 'No') {
                        return;
                    }
                });
        }
    });

    context.subscriptions.push(disposable);
}

function createProjectStructure(projectDir: string, structureFilePath: string) {
    const structure = JSON.parse(fs.readFileSync(structureFilePath, 'utf-8'));

    if (structure.dir && Array.isArray(structure.dir)) {
        structure.dir.forEach((dirPath: string) => {
            createDirectory(projectDir, dirPath);
        });
    } else {
        vscode.window.showErrorMessage('Invalid structure in structure.json file.');
    }
}

function createDirectory(projectDir: string, fullPath: string) {
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
        } else {
            vscode.window.showInformationMessage(`Directory "${currentPath}" already exists.`);
        }
    }
}

export function deactivate() {}
