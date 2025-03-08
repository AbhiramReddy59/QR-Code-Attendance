import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Tab,
    Tabs,
    CircularProgress,
    Alert,
    Avatar,
    Button
} from '@mui/material';
import { getProfile } from '../utils/api';
import QRScanner from './QRScanner';
import AttendanceReport from './AttendanceReport';
import { useAuth } from '../context/AuthContext';

const EmployeeProfile = () => {
    const { token } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        if (token) {
            fetchProfile();
        }
    }, [token]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getProfile();
            setProfile(response.data);
        } catch (err) {
            console.error('Error fetching profile:', err);
            setError('Failed to load profile data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Alert 
                severity="error" 
                sx={{ m: 2 }}
                action={
                    <Button color="inherit" size="small" onClick={fetchProfile}>
                        Retry
                    </Button>
                }
            >
                {error}
            </Alert>
        );
    }

    if (!profile) {
        return (
            <Alert severity="info" sx={{ m: 2 }}>
                No profile data found. Please make sure you are logged in.
            </Alert>
        );
    }

    return (
        <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
            <Paper sx={{ p: 3, mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            mr: 3,
                            bgcolor: 'primary.main'
                        }}
                    >
                        {profile.name?.charAt(0)}
                    </Avatar>
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            {profile.name}
                        </Typography>
                        <Typography color="textSecondary" gutterBottom>
                            {profile.email}
                        </Typography>
                        <Typography color="textSecondary">
                            {profile.department} • {profile.position}
                        </Typography>
                    </Box>
                </Box>

                {profile.qr_code && (
                    <Box sx={{ textAlign: 'center', mb: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Your QR Code
                        </Typography>
                        <img
                            src={profile.qr_code}
                            alt="Employee QR Code"
                            style={{ maxWidth: '250px' }}
                        />
                    </Box>
                )}
            </Paper>

            <Paper sx={{ width: '100%' }}>
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    variant="fullWidth"
                >
                    <Tab label="Mark Attendance" />
                    <Tab label="My Attendance" />
                </Tabs>

                <Box sx={{ p: 2 }}>
                    {activeTab === 0 && <QRScanner />}
                    {activeTab === 1 && <AttendanceReport personalReport={true} />}
                </Box>
            </Paper>
        </Box>
    );
};

export default EmployeeProfile;
