import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    TextField,
    Typography,
    Container,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { styled } from '@mui/material/styles';

// Styled components
const GradientBackground = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    padding: theme.spacing(3)
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
}));

const CompanyName = styled(Typography)(({ theme }) => ({
    color: theme.palette.primary.main,
    fontWeight: 700,
    marginBottom: theme.spacing(3),
    textAlign: 'center'
}));

const Login = () => {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Check if user is already logged in
    useEffect(() => {
        if (user) {
            console.log('User is already logged in, redirecting to dashboard...');
            navigate('/dashboard', { replace: true });
        }
    }, [user, navigate]);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            console.log('Attempting login with email:', formData.email);
            const response = await login(formData.email, formData.password);
            console.log('Login response:', response);

            if (response.success) {
                console.log('Login successful, redirecting to dashboard...');
                navigate('/dashboard', { replace: true });
            } else {
                console.error('Login failed:', response.message);
                setError(response.message || 'Invalid email or password');
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'An error occurred during login');
        } finally {
            setLoading(false);
        }
    };

    return (
        <GradientBackground>
            <Container component="main" maxWidth="xs">
                <StyledPaper elevation={6}>
                    <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        width: '100%'
                    }}>
                        {/* Logo and Company Name */}
                        <CompanyName variant="h4" gutterBottom>
                            VTS
                        </CompanyName>
                        <Typography variant="h5" gutterBottom sx={{ color: 'text.secondary' }}>
                            QR Attendance System
                        </Typography>

                        {/* Login Form */}
                        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, width: '100%' }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                value={formData.email}
                                onChange={handleChange}
                                disabled={loading}
                                error={!!error}
                            />
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type="password"
                                id="password"
                                autoComplete="current-password"
                                value={formData.password}
                                onChange={handleChange}
                                disabled={loading}
                                error={!!error}
                            />
                            
                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                disabled={loading || !formData.email || !formData.password}
                                sx={{
                                    mt: 3,
                                    mb: 2,
                                    py: 1.5,
                                    background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #1e3c72 60%, #2a5298 90%)',
                                    }
                                }}
                            >
                                {loading ? (
                                    <>
                                        <CircularProgress size={24} sx={{ mr: 1, color: 'white' }} />
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>

                            <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 2 }}>
                                {new Date().getFullYear()} VTS. All rights reserved.
                            </Typography>
                        </Box>
                    </Box>
                </StyledPaper>
            </Container>
        </GradientBackground>
    );
};

export default Login;
