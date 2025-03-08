const axios = require('axios');

const createEmployee = async () => {
    try {
        const response = await axios.post('http://localhost:5000/api/employees', {
            name: 'Abhiram Reddy E',
            email: 'abhiramreddye@outlook.com',
            password: 'Jarvis@1234',
            department: 'Engineering',
            position: 'Developer'
        });
        console.log('Employee created successfully:', response.data);
    } catch (error) {
        console.error('Error creating employee:', error.response?.data || error.message);
    }
};

createEmployee();
