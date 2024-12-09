const jwt = require('jsonwebtoken');

const SECRET_KEY = 'myKey'; // Replace with your actual secret key

function generateToken(userId) {
    const payload = { userId }; // Payload containing user information
    const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '48h' }); // Token valid for 48 hour
    return token;
}

// Example usage
const userId = 'user2';
const token = generateToken(userId);
console.log('Generated JWT Token:', token);
