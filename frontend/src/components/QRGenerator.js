import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import QRCode from 'qrcode.react';
import { useAuth } from '../context/AuthContext';

const QRGenerator = () => {
    const { user } = useAuth();

    // Create QR code data
    const qrData = JSON.stringify({
        employeeId: user?.id,
        email: user?.email
    });

    return (
        <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
                Your Attendance QR Code
            </Typography>
            
            <Typography variant="body2" color="text.secondary" gutterBottom>
                Show this QR code to mark your attendance
            </Typography>

            <Paper 
                elevation={3} 
                sx={{ 
                    p: 3, 
                    mt: 2, 
                    display: 'inline-block',
                    backgroundColor: 'white' 
                }}
            >
                <QRCode
                    value={qrData}
                    size={256}
                    level="H"
                    includeMargin={true}
                    renderAs="svg"
                />
            </Paper>

            <Typography variant="body2" sx={{ mt: 2 }}>
                Employee ID: {user?.id}
            </Typography>
            <Typography variant="body2">
                Email: {user?.email}
            </Typography>
        </Box>
    );
};

export default QRGenerator;
