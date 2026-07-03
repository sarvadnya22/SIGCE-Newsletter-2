const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/authRoutes');
const newsletterRoutes = require('./routes/newsletterRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const aiRoutes = require('./routes/aiRoutes');
const pdfRoutes = require('./routes/pdfRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/newsletters', newsletterRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/pdf', pdfRoutes);

// Routes (to be added)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'API is running' });
});

const sequelize = require('./config/database');
const fs = require('fs');
const path = require('path');

const connectDB = async () => {
  let User;
  try {
    await sequelize.authenticate();
    console.log('SQLite connected successfully.');
    
    // Initialize models before sync
    User = require('./models/User');
    require('./models/Newsletter');
    
    // Sync models to the database (creates tables if they don't exist)
    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');
  } catch (err) {
    console.error('Unable to connect to the database:', err);
    process.exit(1);
  }
  
  const bcrypt = require('bcrypt');

  const seedDefaultUser = async () => {
    try {
      const defaultUser = await User.findOne({ where: { username: 'admin' } });
      if (!defaultUser) {
        console.log('No default admin user found. Creating one...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('admin123', salt);
        await User.create({ username: 'admin', password: hashedPassword });
        console.log('Default admin user created: username: "admin", password: "admin123"');
      }
      
      const guestUser = await User.findOne({ where: { username: 'guest' } });
      if (!guestUser) {
        console.log('No default guest user found. Creating one...');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash('guest123', salt);
        await User.create({ username: 'guest', password: hashedPassword });
        console.log('Default guest user created: username: "guest", password: "guest123"');
      }
    } catch (err) {
      console.error('Error seeding default users:', err);
    }
  };

  app.listen(PORT, '0.0.0.0', async () => {
    console.log(`Server running on port ${PORT} (IPv4)`);
    await seedDefaultUser();
  });
};

connectDB();
