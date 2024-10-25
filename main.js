// server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON and CORS
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    next();
});

// User class
class User {
    constructor(id, name, username, email, password, updatedAt, image, rol) {
        this.id = id;
        this.name = name;
        this.username = username;
        this.email = email;
        this.password = password;
        this.updatedAt = updatedAt;
        this.image = image;
        this.rol = rol;
    }

    updateProfile(newData) {
        if (newData.name) this.name = newData.name;
        if (newData.username) this.username = newData.username;
        if (newData.email) this.email = newData.email;
        if (newData.image) this.image = newData.image;
        this.updatedAt = new Date();
    }

    passwordValid(inputPassword) {
        return this.password === inputPassword;
    }

    // Método para convertir a JSON sin datos sensibles
    toJSON() {
        const { password, ...userWithoutPassword } = this;
        return userWithoutPassword;
    }
}

// In-memory data
let users = [
    new User(1, 'John Doe', 'johndoe', 'john@example.com', 'password123', new Date(), 'john.jpg', 'admin'),
    new User(2, 'Jane Smith', 'janesmith', 'jane@example.com', 'password123', new Date(), 'jane.jpg', 'user'),
    new User(3, 'Robert Brown', 'robbrown', 'robert@example.com', 'password123', new Date(), 'robert.jpg', 'user')
];

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Welcome to Users API',
        version: '1.0',
        endpoints: {
            getAllUsers: '/api/users',
            getUserById: '/api/users/:id',
            createUser: '/api/users',
            updateUser: '/api/users/:id',
            deleteUser: '/api/users/:id'
        }
    });
});

// CRUD Endpoints

// Get all users
app.get('/api/users', (req, res) => {
    res.json({
        total: users.length,
        users: users.map(user => user.toJSON())
    });
});

// Get user by ID
app.get('/api/users/:id', (req, res) => {
    const user = users.find(u => u.id == req.params.id);
    if (user) {
        res.json(user.toJSON());
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Create a new user
app.post('/api/users', (req, res) => {
    try {
        const { name, username, email, password, image, rol } = req.body;
        
        // Validación básica
        if (!name || !username || !email || !password) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['name', 'username', 'email', 'password']
            });
        }

        // Verificar si el usuario ya existe
        if (users.some(u => u.username === username || u.email === email)) {
            return res.status(400).json({ 
                message: 'Username or email already exists'
            });
        }

        const newUser = new User(
            users.length + 1,
            name,
            username,
            email,
            password,
            new Date(),
            image || 'default.jpg',
            rol || 'user'
        );

        users.push(newUser);
        res.status(201).json(newUser.toJSON());
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating user',
            error: error.message
        });
    }
});

// Update a user
app.put('/api/users/:id', (req, res) => {
    try {
        const user = users.find(u => u.id == req.params.id);
        if (user) {
            user.updateProfile(req.body);
            res.json(user.toJSON());
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating user',
            error: error.message
        });
    }
});

// Delete a user
app.delete('/api/users/:id', (req, res) => {
    const initialLength = users.length;
    users = users.filter(u => u.id != req.params.id);
    
    if (users.length < initialLength) {
        res.status(204).send();
    } else {
        res.status(404).json({ message: 'User not found' });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: 'Something went wrong!',
        error: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
