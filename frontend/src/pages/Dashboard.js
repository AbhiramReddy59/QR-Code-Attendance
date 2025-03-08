import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper,
    Grid,
    Button,
    Card,
    CardContent,
    AppBar,
    Toolbar,
    IconButton,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QrCodeIcon from '@mui/icons-material/QrCode';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
}));

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.2s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
    },
}));

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const menuItems = [
        {
            title: 'Mark Attendance',
            icon: <QrCodeIcon sx={{ fontSize: 40 }} />,
            description: 'Scan QR code to mark your attendance',
            path: '/attendance'
        },
        {
            title: 'My Profile',
            icon: <PersonIcon sx={{ fontSize: 40 }} />,
            description: 'View and update your profile',
            path: '/profile'
        },
        {
            title: 'Attendance History',
            icon: <AccessTimeIcon sx={{ fontSize: 40 }} />,
            description: 'View your attendance records',
            path: '/attendance'
        }
    ];

    return (
        <Box sx={{ flexGrow: 1 }}>
            <StyledAppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        VTS Attendance System
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" sx={{ mr: 2 }}>
                            Welcome, {user?.name}
                        </Typography>
                        <IconButton color="inherit" onClick={handleLogout}>
                            <LogoutIcon />
                        </IconButton>
                    </Box>
                </Toolbar>
            </StyledAppBar>

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <Grid container spacing={3}>
                    {menuItems.map((item, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <StyledCard>
                                <CardContent sx={{ 
                                    display: 'flex', 
                                    flexDirection: 'column', 
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    height: '100%'
                                }}>
                                    {item.icon}
                                    <Typography variant="h6" sx={{ mt: 2 }}>
                                        {item.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                                        {item.description}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        sx={{
                                            mt: 'auto',
                                            background: 'linear-gradient(45deg, #1e3c72 30%, #2a5298 90%)',
                                            '&:hover': {
                                                background: 'linear-gradient(45deg, #1e3c72 60%, #2a5298 90%)',
                                            }
                                        }}
                                        onClick={() => navigate(item.path)}
                                    >
                                        Access
                                    </Button>
                                </CardContent>
                            </StyledCard>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
};

export default Dashboard;
