import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

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
    try {
        const structure = JSON.parse(fs.readFileSync(structureFilePath, 'utf-8'));

        // Create directories
        if (structure.dir && Array.isArray(structure.dir)) {
            structure.dir.forEach((dirPath: string) => {
                createDirectory(projectDir, dirPath);
            });
        } else {
            vscode.window.showErrorMessage('Invalid structure in structure.json file.');
        }

        // Create files
        if (structure.files && Array.isArray(structure.files)) {
            structure.files.forEach((file: { path: string; filename: string; txt?: string }) => {
                const textContent = file.txt || '';
                createFile(projectDir, file.path, file.filename, textContent);
            });
        }
        // Check for the `cmd` array and run commands if they exist
        if (structure.cmd && Array.isArray(structure.cmd)) {
            runCommands(structure.cmd, projectDir);
        }
    } catch (error: any) {
        console.error(`Error reading or parsing structure.json: ${error.message}`);
        vscode.window.showErrorMessage('Error reading or parsing structure.json file.');
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
            // vscode.window.showInformationMessage(`Directory "${currentPath}" created successfully!`);
        } else {
            vscode.window.showInformationMessage(`Directory "${currentPath}" already exists.`);
        }
    }
}

function createFile(projectDir: string, filePath: string, filename: string, txt: string) {
    const fullFilePath = path.join(projectDir, filePath, filename); // Construct the full file path

    // Ensure the directory for the file exists
    createDirectory(projectDir, filePath);

    // Check if the file already exists
    if (!fs.existsSync(fullFilePath)) {
        fs.writeFileSync(fullFilePath, txt, 'utf-8'); // Create an empty file
        vscode.window.showInformationMessage(`File "${fullFilePath}" created successfully!`);
    } else {
        vscode.window.showInformationMessage(`File "${fullFilePath}" already exists.`);
    }
}

// Function to run commands in the directory where the JSON file is located
function runCommands(commands: string[], workingDir: string) {
    commands.forEach((command) => {
        exec(command, { cwd: workingDir }, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing command: ${command}`, error);
                return;
            }
            if (stderr) {
                console.error(`Error output: ${stderr}`);
            }
            if (stdout) {
                console.log(`Command output: ${stdout}`);
            }
        });
    });
}

export function deactivate() {}
