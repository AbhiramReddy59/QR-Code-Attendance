import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    TextField,
    Button,
    Grid,
    Avatar,
    Alert,
    CircularProgress,
    Divider,
    Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../context/AuthContext';
import { getProfile, updateProfile } from '../utils/api';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import BadgeIcon from '@mui/icons-material/Badge';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    margin: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
}));

const Profile = () => {
    const { user } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        position: ''
    });

    // Check if user is admin based on profile or user context
    const isAdmin = profile?.role === 'admin' || user?.role === 'admin';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError('');
            console.log('Fetching profile data...');
            const response = await getProfile();
            
            console.log('Profile response:', response);
            
            if (response.success) {
                setProfile(response.data);
                setFormData({
                    name: response.data.name || '',
                    email: response.data.email || '',
                    department: response.data.department || '',
                    position: response.data.position || ''
                });
                console.log('Profile data set successfully');
            } else {
                console.error('Failed to fetch profile:', response.message);
                setError('Failed to fetch profile data: ' + response.message);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError(error.message || 'Failed to fetch profile data');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError('');
            setSuccess('');

            const response = await updateProfile(formData);
            
            if (response.success) {
                setSuccess('Profile updated successfully');
                setProfile(response.data);
                setIsEditing(false);
            } else {
                setError('Failed to update profile: ' + response.message);
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            setError(error.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !profile) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <StyledPaper>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <Avatar
                        sx={{
                            width: 100,
                            height: 100,
                            margin: '0 auto',
                            bgcolor: 'primary.main',
                            fontSize: '2.5rem'
                        }}
                    >
                        {profile?.name?.charAt(0) || user?.name?.charAt(0)}
                    </Avatar>
                    <Typography variant="h5" sx={{ mt: 2, fontWeight: 600 }}>
                        {profile?.name || user?.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        {profile?.position || user?.position}
                    </Typography>
                    <Chip
                        icon={profile?.role === 'admin' ? <AdminPanelSettingsIcon /> : <BadgeIcon />}
                        label={profile?.role === 'admin' ? 'Administrator' : 'Employee'}
                        color={profile?.role === 'admin' ? 'primary' : 'default'}
                        variant="outlined"
                    />
                </Box>

                <Divider sx={{ my: 3 }} />

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 3 }}>
                        {success}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Full Name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                disabled={!isEditing}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Email"
                                name="email"
                                value={formData.email}
                                disabled={true}
                                helperText="Email cannot be changed"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Department"
                                name="department"
                                value={formData.department}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Position"
                                name="position"
                                value={formData.position}
                                onChange={handleChange}
                                disabled={!isEditing}
                            />
                        </Grid>
                    </Grid>

                    {profile?.qr_code && (
                        <Box sx={{ mt: 4, textAlign: 'center' }}>
                            <Typography variant="h6" gutterBottom>
                                Your QR Code
                            </Typography>
                            <Box
                                component="img"
                                src={profile.qr_code}
                                alt="QR Code"
                                sx={{
                                    width: 200,
                                    height: 200,
                                    margin: '0 auto',
                                    display: 'block',
                                    border: '1px solid #ddd',
                                    borderRadius: 1,
                                    p: 2
                                }}
                            />
                            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                Use this QR code to mark your attendance
                            </Typography>
                            <Button 
                                variant="outlined" 
                                color="primary" 
                                onClick={fetchProfile}
                                sx={{ mt: 2 }}
                            >
                                Refresh QR Code
                            </Button>
                        </Box>
                    )}

                    <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                        {!isEditing ? (
                            <Button
                                variant="contained"
                                onClick={() => setIsEditing(true)}
                                disabled={loading}
                            >
                                Edit Profile
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setIsEditing(false);
                                        setFormData({
                                            name: profile?.name || '',
                                            email: profile?.email || '',
                                            department: profile?.department || '',
                                            position: profile?.position || ''
                                        });
                                    }}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <CircularProgress size={24} sx={{ mr: 1 }} />
                                            Saving...
                                        </>
                                    ) : (
                                        'Save Changes'
                                    )}
                                </Button>
                            </>
                        )}
                    </Box>
                </form>
            </StyledPaper>
        </Box>
    );
};

export default Profile;
