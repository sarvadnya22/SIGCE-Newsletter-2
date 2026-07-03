const User = require('../models/User');

module.exports = async function(req, res, next) {
  try {
    if (req.user) {
      const user = await User.findByPk(req.user);
      if (user && user.username === 'guest') {
        return res.status(403).json({ message: 'Action disabled in Demo/Guest mode' });
      }
    }
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error in demo middleware', error: err.message });
  }
};
