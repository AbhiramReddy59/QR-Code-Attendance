import React, { useState, useRef } from 'react';
import Webcam from 'react-webcam';
import { Box, Button, Paper, Typography, Alert } from '@mui/material';
import { markAttendance } from '../utils/api';
import jsQR from 'jsqr';

const AttendanceScanner = () => {
    const webcamRef = useRef(null);
    const [scanning, setScanning] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const capture = React.useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        if (imageSrc) {
            const image = new Image();
            image.src = imageSrc;
            image.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = image.width;
                canvas.height = image.height;
                const context = canvas.getContext('2d');
                context.drawImage(image, 0, 0);
                const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
                const code = jsQR(imageData.data, imageData.width, imageData.height);
                
                if (code) {
                    handleQRCode(code.data);
                }
            };
        }
    }, [webcamRef]);

    const handleQRCode = async (qrData) => {
        try {
            let parsedData = JSON.parse(qrData);
            const response = await markAttendance({
                employeeId: parsedData.employeeId,
                qrData: qrData
            });
            setMessage(response.data.message);
            setError(null);
            // Temporarily stop scanning after successful scan
            setScanning(false);
            setTimeout(() => setMessage(null), 3000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to mark attendance');
            setTimeout(() => setError(null), 3000);
        }
    };

    React.useEffect(() => {
        let interval;
        if (scanning) {
            interval = setInterval(() => {
                capture();
            }, 500);
        }
        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [scanning, capture]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Paper sx={{ p: 2, width: '100%', maxWidth: 640 }}>
                {message && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {message}
                    </Alert>
                )}
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box sx={{ position: 'relative', width: '100%', height: 480 }}>
                    <Webcam
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                    {scanning && (
                        <Box
                            sx={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                width: '200px',
                                height: '200px',
                                border: '2px solid #00ff00',
                                boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                            }}
                        />
                    )}
                </Box>
                <Button
                    variant="contained"
                    fullWidth
                    sx={{ mt: 2 }}
                    onClick={() => setScanning(!scanning)}
                >
                    {scanning ? 'Stop Scanning' : 'Start Scanning'}
                </Button>
            </Paper>
            <Typography variant="body2" color="text.secondary" align="center">
                Position the QR code within the green box to scan
            </Typography>
        </Box>
    );
};

export default AttendanceScanner;
