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
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Typography,
    CircularProgress,
    Alert
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
import { getAttendanceReport, getPersonalAttendance } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const AttendanceReport = ({ personalReport = false }) => {
    const { user } = useAuth();
    const [attendanceData, setAttendanceData] = useState([]);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const [department, setDepartment] = useState('');
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAttendanceData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const params = {
                startDate: startDate ? format(startDate, 'yyyy-MM-dd') : undefined,
                endDate: endDate ? format(endDate, 'yyyy-MM-dd') : undefined,
                department: department || undefined
            };
            
            const response = personalReport 
                ? await getPersonalAttendance(params)
                : await getAttendanceReport(params);
            
            setAttendanceData(response.data || []);
            
            if (!personalReport && response.data.length > 0) {
                const uniqueDepartments = [...new Set(response.data.map(record => record.department))];
                setDepartments(uniqueDepartments);
            }
        } catch (error) {
            console.error('Failed to fetch attendance data:', error);
            setError('Failed to load attendance data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAttendanceData();
    }, []);

    const handleGenerateReport = () => {
        fetchAttendanceData();
    };

    const handleExportCSV = () => {
        const headers = personalReport ? ['Date', 'Check In', 'Check Out', 'Hours Worked'] : ['Name', 'Department', 'Check In', 'Check Out', 'Hours Worked'];
        const csvData = attendanceData.map(record => personalReport ? [
            format(new Date(record.check_in), 'yyyy-MM-dd'),
            format(new Date(record.check_in), 'HH:mm:ss'),
            record.check_out ? format(new Date(record.check_out), 'HH:mm:ss') : 'Not checked out',
            record.hours_worked || record.hours_worked === 0 ? Number(record.hours_worked).toFixed(2) : '-'
        ] : [
            record.name,
            record.department,
            format(new Date(record.check_in), 'yyyy-MM-dd HH:mm:ss'),
            record.check_out ? format(new Date(record.check_out), 'yyyy-MM-dd HH:mm:ss') : 'Not checked out',
            record.hours_worked !== null ? Number(record.hours_worked).toFixed(2) : '-'
        ]);

        const csvContent = [headers, ...csvData]
            .map(row => row.join(','))
            .join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = personalReport ? `attendance-${format(new Date(), 'yyyy-MM-dd')}.csv` : `attendance-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <Box>
            <Typography variant="h6" gutterBottom>
                {personalReport ? 'My Attendance Report' : 'Attendance Report'}
            </Typography>
            
            <Paper sx={{ p: 2, mb: 3 }}>
                <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                        <DatePicker
                            label="Start Date"
                            value={startDate}
                            onChange={setStartDate}
                            renderInput={(params) => <TextField {...params} />}
                        />
                        <DatePicker
                            label="End Date"
                            value={endDate}
                            onChange={setEndDate}
                            renderInput={(params) => <TextField {...params} />}
                        />
                    </LocalizationProvider>
                    
                    {!personalReport && (
                        <FormControl sx={{ minWidth: 200 }}>
                            <InputLabel>Department</InputLabel>
                            <Select
                                value={department}
                                label="Department"
                                onChange={(e) => setDepartment(e.target.value)}
                            >
                                <MenuItem value="">All Departments</MenuItem>
                                {departments.map((dept) => (
                                    <MenuItem key={dept} value={dept}>
                                        {dept}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    
                    <Button 
                        variant="contained" 
                        onClick={handleGenerateReport}
                        disabled={loading}
                    >
                        {loading ? 'Loading...' : 'Generate Report'}
                    </Button>
                    
                    <Button 
                        variant="outlined" 
                        onClick={handleExportCSV}
                        disabled={loading || attendanceData.length === 0}
                    >
                        Export CSV
                    </Button>
                </Box>

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
                ) : attendanceData.length === 0 ? (
                    <Alert severity="info" sx={{ mb: 2 }}>No attendance records found</Alert>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    {personalReport ? (
                                        <>
                                            <TableCell>Date</TableCell>
                                            <TableCell>Check In</TableCell>
                                            <TableCell>Check Out</TableCell>
                                            <TableCell>Hours Worked</TableCell>
                                        </>
                                    ) : (
                                        <>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Department</TableCell>
                                            <TableCell>Check In</TableCell>
                                            <TableCell>Check Out</TableCell>
                                            <TableCell>Hours Worked</TableCell>
                                        </>
                                    )}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {attendanceData.map((record, index) => (
                                    <TableRow key={record.id || index}>
                                        {personalReport ? (
                                            <>
                                                <TableCell>
                                                    {format(new Date(record.check_in), 'yyyy-MM-dd')}
                                                </TableCell>
                                                <TableCell>
                                                    {format(new Date(record.check_in), 'HH:mm:ss')}
                                                </TableCell>
                                                <TableCell>
                                                    {record.check_out
                                                        ? format(new Date(record.check_out), 'HH:mm:ss')
                                                        : 'Not checked out'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.hours_worked || record.hours_worked === 0
                                                        ? `${Number(record.hours_worked).toFixed(2)} hrs`
                                                        : '-'}
                                                </TableCell>
                                            </>
                                        ) : (
                                            <>
                                                <TableCell>{record.name}</TableCell>
                                                <TableCell>{record.department}</TableCell>
                                                <TableCell>
                                                    {format(new Date(record.check_in), 'yyyy-MM-dd HH:mm:ss')}
                                                </TableCell>
                                                <TableCell>
                                                    {record.check_out
                                                        ? format(new Date(record.check_out), 'yyyy-MM-dd HH:mm:ss')
                                                        : 'Not checked out'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.hours_worked !== null 
                                                        ? `${Number(record.hours_worked).toFixed(2)} hrs` 
                                                        : '-'}
                                                </TableCell>
                                            </>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>
        </Box>
    );
};

export default AttendanceReport;
