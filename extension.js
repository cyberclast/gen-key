const vscode = require('vscode');
const { generateHexKey, generateBase31Key, generateBase64UrlKey, generatePassword } = require('./keyGenerator');
const { StatusBarManager } = require('./statusBar');

let statusBarManager;
let diagnosticCollection;

/**
 * Check password settings and update diagnostics
 */
function updatePasswordDiagnostics() {
    const config = vscode.workspace.getConfiguration('gen-key');
    const uppercase = config.get('password.uppercase', true);
    const lowercase = config.get('password.lowercase', true);
    const numbers = config.get('password.numbers', true);
    const special = config.get('password.special', true);

    const isValid = uppercase || lowercase || numbers || special;

    if (!isValid) {
        const diagnostic = new vscode.Diagnostic(
            new vscode.Range(0, 0, 0, 0),
            'Password generation disabled: All character sets (uppercase, lowercase, numbers, special) are disabled. Enable at least one character set in settings.',
            vscode.DiagnosticSeverity.Warning
        );
        diagnostic.source = 'gen-key';
        diagnosticCollection.set(vscode.Uri.parse('gen-key://password-config'), [diagnostic]);
    } else {
        diagnosticCollection.clear();
    }
}

/**
 * Called when the extension is activated
 */
function activate(context) {
    // Create diagnostic collection
    diagnosticCollection = vscode.languages.createDiagnosticCollection('gen-key');
    context.subscriptions.push(diagnosticCollection);

    // Initialize status bar manager
    statusBarManager = new StatusBarManager();
    statusBarManager.show();

    // Check password settings on activation
    updatePasswordDiagnostics();

    // Watch for configuration changes
    const configWatcher = vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('gen-key')) {
            // Reload status bar button visibility
            statusBarManager.show();
            // Update diagnostics
            updatePasswordDiagnostics();
        }
    });

    // Register hex key generation command
    const hexCommand = vscode.commands.registerCommand('gen-key.generateHex', async () => {
        try {
            // Check if clipboard currently contains this key
            const clipboardContent = await vscode.env.clipboard.readText();
            const lastKey = statusBarManager.getLastHexKey();

            if (lastKey && clipboardContent === lastKey) {
                // Clear clipboard and tracked keys
                await vscode.env.clipboard.writeText('');
                statusBarManager.clearTrackedKeys();
            } else {
                // Get key length from settings
                const config = vscode.workspace.getConfiguration('gen-key');
                const keyBits = config.get('keyLength', 256);

                // Generate new key
                const key = generateHexKey(keyBits);

                // Copy to clipboard
                await vscode.env.clipboard.writeText(key);

                // Track this key
                statusBarManager.setLastHexKey(key);
            }
        } catch (error) {
            vscode.window.showErrorMessage(
                `Failed to generate hex key: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    });

    // Register base31 key generation command
    const base31Command = vscode.commands.registerCommand('gen-key.generateBase31', async () => {
        try {
            // Check if clipboard currently contains this key
            const clipboardContent = await vscode.env.clipboard.readText();
            const lastKey = statusBarManager.getLastBase31Key();

            if (lastKey && clipboardContent === lastKey) {
                // Clear clipboard and tracked keys
                await vscode.env.clipboard.writeText('');
                statusBarManager.clearTrackedKeys();
            } else {
                // Get key length from settings
                const config = vscode.workspace.getConfiguration('gen-key');
                const keyBits = config.get('keyLength', 256);

                // Generate new key
                const key = generateBase31Key(keyBits);

                // Copy to clipboard
                await vscode.env.clipboard.writeText(key);

                // Track this key
                statusBarManager.setLastBase31Key(key);
            }
        } catch (error) {
            vscode.window.showErrorMessage(
                `Failed to generate base31 key: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    });

    // Register base64url key generation command
    const base64UrlCommand = vscode.commands.registerCommand('gen-key.generateBase64Url', async () => {
        try {
            // Check if clipboard currently contains this key
            const clipboardContent = await vscode.env.clipboard.readText();
            const lastKey = statusBarManager.getLastBase64UrlKey();

            if (lastKey && clipboardContent === lastKey) {
                // Clear clipboard and tracked keys
                await vscode.env.clipboard.writeText('');
                statusBarManager.clearTrackedKeys();
            } else {
                // Get key length from settings
                const config = vscode.workspace.getConfiguration('gen-key');
                const keyBits = config.get('keyLength', 256);

                // Generate new key
                const key = generateBase64UrlKey(keyBits);

                // Copy to clipboard
                await vscode.env.clipboard.writeText(key);

                // Track this key
                statusBarManager.setLastBase64UrlKey(key);
            }
        } catch (error) {
            vscode.window.showErrorMessage(
                `Failed to generate base64url key: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    });

    // Register password generation command
    const passwordCommand = vscode.commands.registerCommand('gen-key.generatePassword', async () => {
        try {
            // Check if clipboard currently contains this password
            const clipboardContent = await vscode.env.clipboard.readText();
            const lastPassword = statusBarManager.getLastPassword();

            if (lastPassword && clipboardContent === lastPassword) {
                // Clear clipboard and tracked keys
                await vscode.env.clipboard.writeText('');
                statusBarManager.clearTrackedKeys();
            } else {
                // Get password settings
                const config = vscode.workspace.getConfiguration('gen-key');
                const length = config.get('password.length', 20);
                const options = {
                    uppercase: config.get('password.uppercase', true),
                    lowercase: config.get('password.lowercase', true),
                    numbers: config.get('password.numbers', true),
                    special: config.get('password.special', true),
                    specialChars: config.get('password.specialChars', '!@#$%^&*()_+-[]{}|;:\'",.<>?'),
                };

                // Generate new password
                const password = generatePassword(length, options);

                // Copy to clipboard
                await vscode.env.clipboard.writeText(password);

                // Track this password
                statusBarManager.setLastPassword(password);
            }
        } catch (error) {
            vscode.window.showErrorMessage(
                `Failed to generate password: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    });

    // Add disposables to context
    context.subscriptions.push(hexCommand);
    context.subscriptions.push(base31Command);
    context.subscriptions.push(base64UrlCommand);
    context.subscriptions.push(passwordCommand);
    context.subscriptions.push(configWatcher);
    context.subscriptions.push(statusBarManager);
}

/**
 * Called when the extension is deactivated
 */
function deactivate() {
    // Cleanup handled by dispose methods
}

module.exports = {
    activate,
    deactivate,
};
