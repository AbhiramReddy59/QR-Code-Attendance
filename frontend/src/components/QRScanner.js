import React, { useState } from 'react';
import QrScanner from 'react-qr-scanner';
import {
    Box,
    Typography,
    Alert,
    CircularProgress,
    Paper,
    Button
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { markAttendance } from '../utils/api';
import CameraAltIcon from '@mui/icons-material/CameraAlt';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    borderRadius: theme.spacing(2),
    maxWidth: '500px',
    margin: '0 auto'
}));

const QRScanner = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [permission, setPermission] = useState(true);
    const [scannerActive, setScannerActive] = useState(true);

    const handleScan = async (data) => {
        if (data && !loading && data.text) {
            try {
                setLoading(true);
                setError('');
                setSuccess('');
                setScannerActive(false);

                console.log('QR Code scanned raw data:', data);
                console.log('QR Code scanned text:', data.text);
                
                // Process the QR code data
                let qrData;
                
                // First, try to extract any JSON from the scanned text
                // This handles cases where Google Lens might add extra text
                if (data.text.includes('{') && data.text.includes('}')) {
                    try {
                        const jsonStartIndex = data.text.indexOf('{');
                        const jsonEndIndex = data.text.lastIndexOf('}') + 1;
                        const jsonString = data.text.substring(jsonStartIndex, jsonEndIndex);
                        
                        console.log('Extracted JSON string:', jsonString);
                        qrData = JSON.parse(jsonString);
                        console.log('Parsed QR data:', qrData);
                    } catch (parseError) {
                        console.error('Error parsing extracted JSON:', parseError);
                        qrData = { text: data.text };
                    }
                } else {
                    // If no JSON format is detected, use the raw text
                    qrData = { text: data.text };
                }
                
                // Send the processed QR data to the server
                const response = await markAttendance(qrData);

                if (response.success) {
                    setSuccess(response.message);
                    // Auto-clear success message and re-enable scanner after 5 seconds
                    setTimeout(() => {
                        setSuccess('');
                        setScannerActive(true);
                    }, 5000);
                } else {
                    setError(response.message || 'Failed to mark attendance');
                    // Re-enable scanner after error
                    setTimeout(() => {
                        setScannerActive(true);
                    }, 3000);
                }
            } catch (error) {
                console.error('Error marking attendance:', error);
                setError(error.message || 'Failed to mark attendance');
                // Re-enable scanner after error
                setTimeout(() => {
                    setScannerActive(true);
                }, 3000);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleError = (error) => {
        console.error('QR Scanner error:', error);
        if (error?.name === 'NotAllowedError') {
            setPermission(false);
            setError('Camera access denied. Please allow camera access to scan QR codes.');
        } else {
            setError('Error accessing camera. Please try again.');
        }
    };

    const resetScanner = () => {
        setError('');
        setSuccess('');
        setScannerActive(true);
    };

    if (!permission) {
        return (
            <StyledPaper>
                <Alert 
                    severity="error" 
                    sx={{ width: '100%', mb: 2 }}
                >
                    Camera access is required to scan QR codes. Please allow camera access in your browser settings and refresh the page.
                </Alert>
                <Typography variant="body2" color="text.secondary" align="center">
                    To enable camera access:
                    <ol>
                        <li>Click the camera icon in your browser's address bar</li>
                        <li>Select "Allow" for camera access</li>
                        <li>Refresh this page</li>
                    </ol>
                </Typography>
            </StyledPaper>
        );
    }

    return (
        <StyledPaper>
            <Typography variant="h6" gutterBottom align="center">
                Scan QR Code
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }} align="center">
                Position the QR code within the camera frame to mark your attendance
            </Typography>

            {error && (
                <Alert 
                    severity="error" 
                    sx={{ width: '100%', mb: 2 }}
                    onClose={() => setError('')}
                >
                    {error}
                </Alert>
            )}

            {success && (
                <Alert 
                    severity="success" 
                    sx={{ width: '100%', mb: 2 }}
                    onClose={() => setSuccess('')}
                >
                    {success}
                </Alert>
            )}

            <Box 
                sx={{ 
                    width: '100%', 
                    maxWidth: '400px',
                    position: 'relative',
                    '& video': {
                        borderRadius: 2
                    }
                }}
            >
                {loading && (
                    <Box 
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            zIndex: 1,
                            borderRadius: 2
                        }}
                    >
                        <CircularProgress />
                    </Box>
                )}
                
                {scannerActive ? (
                    <QrScanner
                        onScan={handleScan}
                        onError={handleError}
                        constraints={{
                            video: {
                                facingMode: 'environment'
                            }
                        }}
                        style={{
                            width: '100%',
                            height: '100%'
                        }}
                    />
                ) : (
                    <Box 
                        sx={{
                            width: '100%',
                            height: '300px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#f5f5f5',
                            borderRadius: 2,
                            border: '1px dashed #ccc'
                        }}
                    >
                        <CameraAltIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                        <Button 
                            variant="contained" 
                            onClick={resetScanner}
                            sx={{ mt: 2 }}
                        >
                            Scan Again
                        </Button>
                    </Box>
                )}
            </Box>

            <Typography 
                variant="caption" 
                color="text.secondary" 
                sx={{ mt: 2 }} 
                align="center"
            >
                Make sure your camera is well-lit and the QR code is clearly visible
            </Typography>
        </StyledPaper>
    );
};

export default QRScanner;
