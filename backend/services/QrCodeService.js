const QRCode = require('qrcode');
const config = require('../config');

class QrCodeService {
  static async generateQrCode(shortCode) {
    try {
      const qrCodeText = `${config.app.baseUrl}/${shortCode}`;
      const qrCodeBuffer = await QRCode.toBuffer(qrCodeText, {
        type: 'png',
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return qrCodeBuffer;
    } catch (error) {
      throw new Error('Failed to generate QR code: ' + error.message);
    }
  }

  static async generateQrCodeDataUrl(shortCode) {
    try {
      const qrCodeText = `${config.app.baseUrl}/${shortCode}`;
      const dataUrl = await QRCode.toDataURL(qrCodeText, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      return dataUrl;
    } catch (error) {
      throw new Error('Failed to generate QR code data URL: ' + error.message);
    }
  }
}

module.exports = QrCodeService;
