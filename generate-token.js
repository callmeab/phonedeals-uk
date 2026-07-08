const jwt = require('jsonwebtoken');

const token = jwt.sign(
  { id: 1, email: 'admin@phonedeals.co.uk' },
  'local-dev-placeholder-secret-change-me',
  { expiresIn: '1h' }
);
console.log('Generated token:', token);
