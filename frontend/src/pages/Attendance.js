import React, { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    CircularProgress,
    Button,
    Tabs,
    Tab,
    Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import QRScanner from '../components/QRScanner';
import { getPersonalAttendance } from '../utils/api';
import RefreshIcon from '@mui/icons-material/Refresh';

const StyledPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(3),
    margin: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)'
}));

const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ padding: '24px 0' }}>
        {value === index && children}
    </div>
);

const Attendance = () => {
    const [tabValue, setTabValue] = useState(0);
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (tabValue === 1) {
            fetchAttendance();
        }
    }, [tabValue]);

    const fetchAttendance = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await getPersonalAttendance();
            
            if (response.success) {
                setAttendance(response.data || []);
            } else {
                setError(response.message || 'Failed to fetch attendance records');
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
            setError(error.message || 'Failed to fetch attendance records');
        } finally {
            setLoading(false);
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    return (
        <Box>
            <StyledPaper>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs 
                        value={tabValue} 
                        onChange={handleTabChange}
                        variant="fullWidth"
                    >
                        <Tab label="Mark Attendance" />
                        <Tab label="Attendance History" />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <QRScanner />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : error ? (
                        <Alert 
                            severity="error" 
                            sx={{ mt: 2 }}
                            action={
                                <Button color="inherit" size="small" onClick={fetchAttendance}>
                                    Retry
                                </Button>
                            }
                        >
                            {error}
                        </Alert>
                    ) : attendance.length === 0 ? (
                        <Alert severity="info" sx={{ mt: 2 }}>
                            No attendance records found
                        </Alert>
                    ) : (
                        <>
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                                <Button 
                                    startIcon={<RefreshIcon />} 
                                    onClick={fetchAttendance}
                                    size="small"
                                >
                                    Refresh
                                </Button>
                            </Box>
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Check In</TableCell>
                                            <TableCell>Check Out</TableCell>
                                            <TableCell>Hours Worked</TableCell>
                                            <TableCell>Status</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {attendance.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell>
                                                    {typeof record.check_in === 'string' && record.check_in.includes('T') 
                                                        ? new Date(record.check_in).toLocaleDateString() 
                                                        : record.check_in.split(',')[0]}
                                                </TableCell>
                                                <TableCell>
                                                    {record.check_in}
                                                </TableCell>
                                                <TableCell>
                                                    {record.check_out || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.hours_worked ? `${record.hours_worked} hrs` : 'In Progress'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.status || (record.check_out ? 'Completed' : 'In Progress')}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </>
                    )}
                </TabPanel>
            </StyledPaper>
        </Box>
    );
};

export default Attendance;
