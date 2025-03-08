import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Typography
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, QrCode as QrCodeIcon } from '@mui/icons-material';
import { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } from '../utils/api';

const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [open, setOpen] = useState(false);
    const [qrDialogOpen, setQrDialogOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        department: '',
        position: ''
    });

    const fetchEmployees = async () => {
        try {
            const response = await getAllEmployees();
            setEmployees(response.data);
        } catch (error) {
            console.error('Failed to fetch employees:', error);
        }
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const handleOpen = (employee = null) => {
        if (employee) {
            setSelectedEmployee(employee);
            setFormData({
                name: employee.name,
                email: employee.email,
                department: employee.department,
                position: employee.position
            });
        } else {
            setSelectedEmployee(null);
            setFormData({
                name: '',
                email: '',
                department: '',
                position: ''
            });
        }
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setSelectedEmployee(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (selectedEmployee) {
                await updateEmployee(selectedEmployee.id, formData);
            } else {
                await createEmployee(formData);
            }
            handleClose();
            fetchEmployees();
        } catch (error) {
            console.error('Failed to save employee:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this employee?')) {
            try {
                await deleteEmployee(id);
                fetchEmployees();
            } catch (error) {
                console.error('Failed to delete employee:', error);
            }
        }
    };

    const handleShowQR = (employee) => {
        setSelectedEmployee(employee);
        setQrDialogOpen(true);
    };

    return (
        <Box>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">Employee Management</Typography>
                <Button variant="contained" onClick={() => handleOpen()}>
                    Add Employee
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell>Position</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {employees.map((employee) => (
                            <TableRow key={employee.id}>
                                <TableCell>{employee.name}</TableCell>
                                <TableCell>{employee.email}</TableCell>
                                <TableCell>{employee.department}</TableCell>
                                <TableCell>{employee.position}</TableCell>
                                <TableCell>
                                    <IconButton onClick={() => handleOpen(employee)}>
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(employee.id)}>
                                        <DeleteIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleShowQR(employee)}>
                                        <QrCodeIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Employee Form Dialog */}
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>{selectedEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
                <DialogContent>
                    <Box component="form" sx={{ mt: 2 }}>
                        <TextField
                            fullWidth
                            label="Name"
                            name="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Department"
                            name="department"
                            value={formData.department}
                            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                            margin="normal"
                            required
                        />
                        <TextField
                            fullWidth
                            label="Position"
                            name="position"
                            value={formData.position}
                            onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                            margin="normal"
                            required
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {selectedEmployee ? 'Update' : 'Add'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* QR Code Dialog */}
            <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)}>
                <DialogTitle>Employee QR Code</DialogTitle>
                <DialogContent>
                    {selectedEmployee?.qr_code && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                            <img src={selectedEmployee.qr_code} alt="QR Code" style={{ width: 200, height: 200 }} />
                            <Typography variant="body2" color="text.secondary">
                                {selectedEmployee.name}'s QR Code
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => {
                                    const link = document.createElement('a');
                                    link.download = `qr-code-${selectedEmployee.id}.png`;
                                    link.href = selectedEmployee.qr_code;
                                    link.click();
                                }}
                            >
                                Download QR Code
                            </Button>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default EmployeeList;
