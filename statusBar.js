const vscode = require('vscode');

/**
 * Manages the status bar buttons for key generation with clipboard monitoring
 */
class StatusBarManager {
    constructor() {
        this.lastHexKey = null;
        this.lastBase31Key = null;
        this.lastBase64UrlKey = null;
        this.lastPassword = null;
        this.clipboardCheckInterval = null;
        this.pulseState = false;
        this.pulseInterval = null;
        this.currentMatches = { hex: false, base31: false, base64Url: false, password: false };

        // Create status bar buttons
        this.hexKeyButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 98);
        this.hexKeyButton.text = '$(key) Hex';
        this.hexKeyButton.command = 'gen-key.generateHex';

        this.base31KeyButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
        this.base31KeyButton.text = '$(key) Base31';
        this.base31KeyButton.command = 'gen-key.generateBase31';

        this.base64UrlKeyButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.base64UrlKeyButton.text = '$(key) Base64';
        this.base64UrlKeyButton.command = 'gen-key.generateBase64Url';

        this.passwordButton = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 97);
        this.passwordButton.text = '$(key) Pass';
        this.passwordButton.command = 'gen-key.generatePassword';

        // Set initial tooltips based on settings
        this.updateTooltips();

        // Start clipboard monitoring
        this.startClipboardMonitoring();
    }

    /**
     * Update button tooltips based on current settings
     */
    updateTooltips() {
        const config = vscode.workspace.getConfiguration('gen-key');
        const keyBits = config.get('keyLength', 256);
        const passwordLength = config.get('password.length', 20);

        this.hexKeyButton.tooltip = `Copy ${keyBits}-bit hex`;
        this.base31KeyButton.tooltip = `Copy ${keyBits}-bit base31`;
        this.base64UrlKeyButton.tooltip = `Copy ${keyBits}-bit base64url`;
        this.passwordButton.tooltip = `Copy ${passwordLength}-character password`;
    }

    /**
     * Record the last generated hex key
     */
    setLastHexKey(key) {
        this.lastHexKey = key;
    }

    /**
     * Record the last generated base31 key
     */
    setLastBase31Key(key) {
        this.lastBase31Key = key;
    }

    /**
     * Record the last generated base64url key
     */
    setLastBase64UrlKey(key) {
        this.lastBase64UrlKey = key;
    }

    /**
     * Record the last generated password
     */
    setLastPassword(password) {
        this.lastPassword = password;
    }

    /**
     * Get the last generated hex key
     */
    getLastHexKey() {
        return this.lastHexKey;
    }

    /**
     * Get the last generated base31 key
     */
    getLastBase31Key() {
        return this.lastBase31Key;
    }

    /**
     * Get the last generated base64url key
     */
    getLastBase64UrlKey() {
        return this.lastBase64UrlKey;
    }

    /**
     * Get the last generated password
     */
    getLastPassword() {
        return this.lastPassword;
    }

    /**
     * Clear tracked keys
     */
    clearTrackedKeys() {
        this.lastHexKey = null;
        this.lastBase31Key = null;
        this.lastBase64UrlKey = null;
        this.lastPassword = null;
        this.stopPulseAnimation();
        this.resetButtonAppearance();
    }

    /**
     * Start monitoring clipboard for sensitive keys
     */
    startClipboardMonitoring() {
        this.clipboardCheckInterval = setInterval(async () => {
            await this.checkClipboard();
        }, 500); // Check every 500ms
    }

    /**
     * Check if clipboard contains a generated key and update button appearance
     */
    async checkClipboard() {
        try {
            const clipboardContent = await vscode.env.clipboard.readText();

            const hexMatch = this.lastHexKey && clipboardContent === this.lastHexKey;
            const base31Match = this.lastBase31Key && clipboardContent === this.lastBase31Key;
            const base64UrlMatch = this.lastBase64UrlKey && clipboardContent === this.lastBase64UrlKey;
            const passwordMatch = this.lastPassword && clipboardContent === this.lastPassword;

            // Update stored match state
            this.currentMatches = {
                hex: hexMatch,
                base31: base31Match,
                base64Url: base64UrlMatch,
                password: passwordMatch,
            };

            if (hexMatch || base31Match || base64UrlMatch || passwordMatch) {
                this.startPulseAnimation();
            } else {
                this.stopPulseAnimation();
                this.resetButtonAppearance();
            }
        } catch (error) {
            // Silently handle clipboard read errors
        }
    }

    /**
     * Start pulsing animation for buttons with keys in clipboard
     */
    startPulseAnimation() {
        if (!this.pulseInterval) {
            this.pulseState = true; // Start with red showing
            this.pulseInterval = setInterval(() => {
                this.pulseState = !this.pulseState;
                this.updateButtonColors();
            }, 250); // Pulse every 250ms
        }
        this.updateButtonColors();
    }

    /**
     * Update button colors based on pulse state
     */
    updateButtonColors() {
        const config = vscode.workspace.getConfiguration('gen-key');
        const keyBits = config.get('keyLength', 256);
        const passwordLength = config.get('password.length', 20);

        if (this.currentMatches.hex) {
            this.hexKeyButton.backgroundColor = this.pulseState
                ? new vscode.ThemeColor('statusBarItem.errorBackground')
                : undefined;
            this.hexKeyButton.tooltip = 'Clear clipboard';
        } else {
            this.hexKeyButton.backgroundColor = undefined;
            this.hexKeyButton.tooltip = `Copy ${keyBits}-bit hex`;
        }

        if (this.currentMatches.base31) {
            this.base31KeyButton.backgroundColor = this.pulseState
                ? new vscode.ThemeColor('statusBarItem.errorBackground')
                : undefined;
            this.base31KeyButton.tooltip = 'Clear clipboard';
        } else {
            this.base31KeyButton.backgroundColor = undefined;
            this.base31KeyButton.tooltip = `Copy ${keyBits}-bit base31`;
        }

        if (this.currentMatches.base64Url) {
            this.base64UrlKeyButton.backgroundColor = this.pulseState
                ? new vscode.ThemeColor('statusBarItem.errorBackground')
                : undefined;
            this.base64UrlKeyButton.tooltip = 'Clear clipboard';
        } else {
            this.base64UrlKeyButton.backgroundColor = undefined;
            this.base64UrlKeyButton.tooltip = `Copy ${keyBits}-bit base64url`;
        }

        if (this.currentMatches.password) {
            this.passwordButton.backgroundColor = this.pulseState
                ? new vscode.ThemeColor('statusBarItem.errorBackground')
                : undefined;
            this.passwordButton.tooltip = 'Clear clipboard';
        } else {
            this.passwordButton.backgroundColor = undefined;
            this.passwordButton.tooltip = `Copy ${passwordLength}-character password`;
        }
    }

    /**
     * Stop pulse animation
     */
    stopPulseAnimation() {
        if (this.pulseInterval) {
            clearInterval(this.pulseInterval);
            this.pulseInterval = null;
        }
    }

    /**
     * Reset button appearance to default
     */
    resetButtonAppearance() {
        const config = vscode.workspace.getConfiguration('gen-key');
        const keyBits = config.get('keyLength', 256);
        const passwordLength = config.get('password.length', 20);

        this.hexKeyButton.backgroundColor = undefined;
        this.hexKeyButton.tooltip = `Copy ${keyBits}-bit hex`;

        this.base31KeyButton.backgroundColor = undefined;
        this.base31KeyButton.tooltip = `Copy ${keyBits}-bit base31`;

        this.base64UrlKeyButton.backgroundColor = undefined;
        this.base64UrlKeyButton.tooltip = `Copy ${keyBits}-bit base64url`;

        this.passwordButton.backgroundColor = undefined;
        this.passwordButton.tooltip = `Copy ${passwordLength}-character password`;
    }

    /**
     * Check if password generation settings are valid
     */
    isPasswordConfigValid() {
        const config = vscode.workspace.getConfiguration('gen-key');
        const uppercase = config.get('password.uppercase', true);
        const lowercase = config.get('password.lowercase', true);
        const numbers = config.get('password.numbers', true);
        const special = config.get('password.special', true);

        return uppercase || lowercase || numbers || special;
    }

    /**
     * Show status bar buttons based on settings
     */
    show() {
        const config = vscode.workspace.getConfiguration('gen-key');

        // Update tooltips to reflect current settings
        this.updateTooltips();

        if (config.get('hex.enabled', true)) {
            this.hexKeyButton.show();
        } else {
            this.hexKeyButton.hide();
        }

        if (config.get('base31.enabled', true)) {
            this.base31KeyButton.show();
        } else {
            this.base31KeyButton.hide();
        }

        if (config.get('base64url.enabled', true)) {
            this.base64UrlKeyButton.show();
        } else {
            this.base64UrlKeyButton.hide();
        }

        // Only show password button if enabled AND settings are valid
        if (config.get('password.enabled', true) && this.isPasswordConfigValid()) {
            this.passwordButton.show();
        } else {
            this.passwordButton.hide();
        }
    }

    /**
     * Dispose of status bar items and stop monitoring
     */
    dispose() {
        if (this.clipboardCheckInterval) {
            clearInterval(this.clipboardCheckInterval);
        }
        this.stopPulseAnimation();
        this.hexKeyButton.dispose();
        this.base31KeyButton.dispose();
        this.base64UrlKeyButton.dispose();
        this.passwordButton.dispose();
    }
}

module.exports = { StatusBarManager };
