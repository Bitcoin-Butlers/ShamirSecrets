# Bitcoin Wallet Descriptor Splitter

A simple web application that splits Bitcoin wallet descriptors into 3 Shamir shares for secure backup using [Shamir's Secret Sharing](https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing).

## Features

- ✅ **Input Methods**: Paste wallet descriptor text
- ✅ **Shamir Secret Sharing**: Splits descriptors into 3 shares (2 required to reconstruct)
- ✅ **Visual Interface**: Clean, modern UI with share cards
- ✅ **Privacy Controls**: Eye/eye-closed toggle to hide/show shares
- ✅ **Download Options**: Download individual shares or all shares at once
- ✅ **Mobile Friendly**: Responsive design that works on all devices

## How It Works

1. **Input**: Enter your Bitcoin wallet descriptor manually or scan a QR code
2. **Split**: The app uses Shamir's Secret Sharing to split your descriptor into 3 shares
3. **Store**: Keep each share in a separate, secure location
4. **Reconstruct**: Later, combine any 2 shares to recover your original wallet descriptor

## Security Notes

- ⚠️ **Keep shares separate**: Store each share in a different physical location
- ⚠️ **Backup securely**: Use encrypted storage for your shares
- ⚠️ **Test recovery**: Always test that you can reconstruct your wallet from the shares
- ⚠️ **No online storage**: Never store shares on internet-connected devices

## Technology

- **Shamir Library**: [secrets.js-grempe](https://github.com/grempe/secrets.js) - Battle-tested JavaScript implementation
- **Styling**: Pure CSS with modern gradients and animations

## Usage

1. Open `index.html` in a modern web browser
2. Enter your Bitcoin wallet descriptor
3. Click "Split into 3 Shares"
4. Download each share to separate secure locations
5. Store shares offline and in different physical locations

## Browser Requirements

- Modern browser with ES6+ support
- No internet connection required after initial load (works offline)

## Development

```bash
# Install dependencies (if using package manager)
npm install

# Or use CDN links as in the current implementation

# Open index.html in browser
```

## License

This project uses the following open-source libraries:

- MIT License - secrets.js-grempe
- MIT License - qrcode.js
- Apache-2.0 License - jsQR

## Disclaimer

**Use at your own risk.** This tool is for educational and backup purposes. Always test your backup recovery process before relying on it for important funds.
