const db = require('../config/database');
const QRCode = require('qrcode');

// Get user profile
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log('Fetching profile for user:', userId);

        const [users] = await db.execute(
            `SELECT 
                e.id,
                e.name,
                e.email,
                e.department,
                e.position,
                e.qr_code,
                r.name as role
            FROM employees e
            LEFT JOIN roles r ON e.role_id = r.id
            WHERE e.id = ?`,
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const user = users[0];
        console.log('User data retrieved:', {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            hasQrCode: !!user.qr_code
        });

        // Generate QR code if not exists
        if (!user.qr_code) {
            console.log('QR code not found, generating new one');
            const qrData = {
                userId: user.id,
                timestamp: new Date().toISOString()
            };

            try {
                console.log('Generating QR code with data:', qrData);
                const qrCode = await QRCode.toDataURL(JSON.stringify(qrData));
                
                // Update user with QR code
                await db.execute(
                    'UPDATE employees SET qr_code = ? WHERE id = ?',
                    [qrCode, user.id]
                );

                user.qr_code = qrCode;
                console.log('QR code generated and saved successfully');
            } catch (qrError) {
                console.error('Error generating QR code:', qrError);
            }
        } else {
            console.log('Using existing QR code');
        }

        // Format the response data
        const responseData = {
            id: user.id,
            name: user.name,
            email: user.email,
            department: user.department,
            position: user.position,
            qr_code: user.qr_code,
            role: user.role || 'employee'
        };

        return res.json({
            success: true,
            data: responseData
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile data',
            error: error.message
        });
    }
};

// Update user profile
const updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name, department, position } = req.body;

        console.log('Updating profile for user:', userId);
        console.log('Update data:', { name, department, position });

        // Validate input
        if (!name) {
            return res.status(400).json({
                success: false,
                message: 'Name is required'
            });
        }

        // Update the employee record
        await db.execute(
            'UPDATE employees SET name = ?, department = ?, position = ? WHERE id = ?',
            [name, department, position, userId]
        );

        // Fetch updated user data
        const [users] = await db.execute(
            `SELECT 
                e.id,
                e.name,
                e.email,
                e.department,
                e.position,
                e.qr_code,
                r.name as role
            FROM employees e
            LEFT JOIN roles r ON e.role_id = r.id
            WHERE e.id = ?`,
            [userId]
        );

        return res.json({
            success: true,
            message: 'Profile updated successfully',
            data: {
                id: users[0].id,
                name: users[0].name,
                email: users[0].email,
                department: users[0].department,
                position: users[0].position,
                qr_code: users[0].qr_code,
                role: users[0].role || 'employee'
            }
        });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

module.exports = {
    getProfile,
    updateProfile
};
