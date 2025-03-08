import React from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { styled } from '@mui/material/styles';

const GradientBackground = styled(Box)(({ theme }) => ({
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
    padding: theme.spacing(3)
}));

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <GradientBackground>
            <Container maxWidth="sm">
                <Box
                    sx={{
                        textAlign: 'center',
                        color: 'white',
                        py: 4,
                        px: 2,
                        borderRadius: 2,
                        backdropFilter: 'blur(10px)',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <Typography variant="h1" component="h1" gutterBottom>
                        404
                    </Typography>
                    <Typography variant="h4" gutterBottom>
                        Page Not Found
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4 }}>
                        The page you're looking for doesn't exist or has been moved.
                    </Typography>
                    <Button
                        variant="contained"
                        onClick={() => navigate('/dashboard')}
                        sx={{
                            background: 'rgba(255, 255, 255, 0.2)',
                            backdropFilter: 'blur(10px)',
                            '&:hover': {
                                background: 'rgba(255, 255, 255, 0.3)',
                            }
                        }}
                    >
                        Back to Dashboard
                    </Button>
                </Box>
            </Container>
        </GradientBackground>
    );
};

export default NotFound;
