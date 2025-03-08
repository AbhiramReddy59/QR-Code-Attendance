const QRCode = require('qrcode');

const generateEmployeeQRCode = async (employeeData) => {
    try {
        const qrData = {
            employeeId: employeeData.id,
            email: employeeData.email,
            name: employeeData.name,
            timestamp: Date.now()
        };
        
        // Generate QR code as data URL
        const qrCodeDataUrl = await QRCode.toDataURL(JSON.stringify(qrData), {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        return qrCodeDataUrl;
    } catch (error) {
        console.error('QR Code generation failed:', error);
        throw error;
    }
};

module.exports = {
    generateEmployeeQRCode
};
