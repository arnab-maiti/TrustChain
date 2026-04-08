const jwt = require('jsonwebtoken');
const generateToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role },  "secretkey", { expiresIn: '5min' });
};
module.exports = generateToken;