const db = require('../config/database');

/**
 * Mark attendance (check-in or check-out) based on QR code data
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const markAttendance = async (req, res) => {
    try {
        const userId = req.user.id;
        let { qrData } = req.body;

        console.log('User ID from token:', userId);
        console.log('Received raw QR data type:', typeof qrData);
        console.log('Received raw QR data:', JSON.stringify(qrData, null, 2));

        // Handle case where qrData might be a string
        if (typeof qrData === 'string') {
            try {
                qrData = JSON.parse(qrData);
                console.log('Successfully parsed QR data string:', JSON.stringify(qrData, null, 2));
            } catch (parseError) {
                console.error('Error parsing QR data string:', parseError);
                qrData = { text: qrData };
            }
        }

        // Validate QR data
        if (!qrData) {
            return res.status(400).json({
                success: false,
                message: 'QR code data is required'
            });
        }

        // If qrData is the raw string from Google Lens, try to extract JSON from it
        if (qrData.text && qrData.text.includes('{') && qrData.text.includes('}')) {
            try {
                // Try to extract JSON from the text
                const jsonStart = qrData.text.indexOf('{');
                const jsonEnd = qrData.text.lastIndexOf('}') + 1;
                const jsonString = qrData.text.substring(jsonStart, jsonEnd);
                
                console.log('Extracted JSON string from text:', jsonString);
                const extractedData = JSON.parse(jsonString);
                
                // Merge the extracted data with qrData
                qrData = { ...qrData, ...extractedData };
                console.log('Merged QR data after extraction:', JSON.stringify(qrData, null, 2));
            } catch (e) {
                console.error('Error extracting JSON from text:', e);
            }
        }

        // Determine the actual user ID to use (from QR code or from token)
        const employeeId = qrData.userId || userId;
        console.log('Using employee ID for attendance:', employeeId);

        // Check if user has an open attendance record (checked in but not out)
        const [existingRecords] = await db.execute(
            'SELECT * FROM attendance WHERE employee_id = ? AND check_out IS NULL',
            [employeeId]
        );
        
        console.log('Existing open records:', existingRecords.length);

        // If no open record exists, create a new check-in record
        if (existingRecords.length === 0) {
            console.log('Creating new check-in record');
            
            try {
                // First try with location_id column
                const [result] = await db.execute(
                    'INSERT INTO attendance (employee_id, check_in) VALUES (?, NOW())',
                    [employeeId]
                );

                if (result.affectedRows > 0) {
                    return res.status(201).json({
                        success: true,
                        message: 'Check-in successful',
                        data: {
                            id: result.insertId,
                            checkIn: new Date()
                        }
                    });
                } else {
                    return res.status(500).json({
                        success: false,
                        message: 'Failed to check in'
                    });
                }
            } catch (dbError) {
                console.error('Database error during check-in:', dbError);
                return res.status(500).json({
                    success: false,
                    message: 'Database error during check-in',
                    error: dbError.message
                });
            }
        } else {
            console.log('Updating existing record for check-out');
            // User has an open record, update it with check-out time
            const openRecord = existingRecords[0];
            
            // Calculate hours worked
            const checkInTime = new Date(openRecord.check_in);
            const checkOutTime = new Date();
            const hoursWorked = (checkOutTime - checkInTime) / (1000 * 60 * 60);
            
            console.log('Hours worked:', hoursWorked.toFixed(2));
            
            // Update the record with check-out time and hours worked
            const [result] = await db.execute(
                'UPDATE attendance SET check_out = NOW(), hours_worked = ? WHERE id = ?',
                [hoursWorked.toFixed(2), openRecord.id]
            );

            if (result.affectedRows > 0) {
                return res.status(200).json({
                    success: true,
                    message: 'Check-out successful',
                    data: {
                        id: openRecord.id,
                        checkIn: checkInTime,
                        checkOut: checkOutTime,
                        hoursWorked: hoursWorked.toFixed(2)
                    }
                });
            } else {
                return res.status(500).json({
                    success: false,
                    message: 'Failed to check out'
                });
            }
        }
    } catch (error) {
        console.error('Error marking attendance:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while marking attendance',
            error: error.message,
            stack: error.stack
        });
    }
};

/**
 * Get personal attendance records for the authenticated user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getPersonalAttendance = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get attendance records without joining locations
        const [records] = await db.execute(
            `SELECT a.* FROM attendance a 
             WHERE a.employee_id = ? 
             ORDER BY a.check_in DESC LIMIT 30`,
            [userId]
        );

        // Format the records for better display
        const formattedRecords = records.map(record => {
            const checkIn = new Date(record.check_in);
            const checkOut = record.check_out ? new Date(record.check_out) : null;
            
            return {
                id: record.id,
                check_in: checkIn.toLocaleString(),
                check_out: checkOut ? checkOut.toLocaleString() : null,
                hours_worked: record.hours_worked,
                status: checkOut ? 'Completed' : 'In Progress'
            };
        });

        return res.status(200).json({
            success: true,
            message: 'Attendance records retrieved successfully',
            data: formattedRecords
        });
    } catch (error) {
        console.error('Error getting personal attendance:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while retrieving attendance records',
            error: error.message
        });
    }
};

module.exports = {
    markAttendance,
    getPersonalAttendance
};
