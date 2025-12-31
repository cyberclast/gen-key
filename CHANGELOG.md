# Change Log

All notable changes to the "Key Generator" extension will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2025-12-31

### Added
- Initial release
- Cryptographically secure key generation using `crypto.randomBytes()`
- Four generation formats:
  - Hexadecimal (64 characters for 256 bits)
  - Base31 (52 characters for 256 bits, human-readable alphabet)
  - Base64url (43 characters for 256 bits, URL-safe)
  - Password (configurable length with character set options)
- Status bar buttons for quick access to generators
- Clipboard monitoring with visual feedback
- Red blinking animation when sensitive keys/passwords remain in clipboard
- One-click clipboard clearing by clicking the blinking button
- Configurable settings:
  - Key length in bits (default: 256)
  - Individual button visibility toggles
  - Password length (default: 20 characters)
  - Password character set customization (uppercase, lowercase, numbers, special characters)
  - Custom special character set with validation
- Live settings updates without extension reload
- Dynamic tooltips showing configured key and password lengths
- Validation warning when all password character sets are disabled
- No key/password storage or logging - everything exists only in clipboard
