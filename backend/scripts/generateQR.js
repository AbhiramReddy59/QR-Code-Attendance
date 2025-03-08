const QRCode = require('qrcode');
const db = require('../config/database');

const generateQR = async () => {
    try {
        // Get employee data
        const [employees] = await db.execute(
            'SELECT id, name, email FROM employees WHERE email = ?',
            ['abhiramreddye@outlook.com']
        );

        if (employees.length === 0) {
            console.error('Employee not found');
            process.exit(1);
        }

        const employee = employees[0];

        // Generate QR code data
        const qrData = {
            id: employee.id,
            email: employee.email,
            name: employee.name,
            timestamp: Date.now()
        };

        // Generate QR code
        const qrCode = await QRCode.toDataURL(JSON.stringify(qrData), {
            width: 300,
            margin: 2,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        // Update employee with QR code
        await db.execute(
            'UPDATE employees SET qr_code = ? WHERE id = ?',
            [qrCode, employee.id]
        );

        console.log('QR code generated successfully for:', employee.name);
        process.exit(0);
    } catch (error) {
        console.error('Error generating QR code:', error);
        process.exit(1);
    }
};

generateQR();
