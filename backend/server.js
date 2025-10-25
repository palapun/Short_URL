const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const database = require('./mongodb');
const config = require('./config');

const urlRoutes = require('./routes/urls');
const authRoutes = require('./routes/auth');
const RedirectController = require('./controllers/RedirectController');

const app = express();

app.use(helmet());

app.use(cors({
  origin: ['http://localhost:3000', 'https://your-app-name.netlify.app', 'https://*.netlify.app'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: 15 * 60 // 15 minutes in seconds
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.set('trust proxy', 1);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/urls', urlRoutes);
app.use('/api/auth', authRoutes);

app.get('/:shortCode', RedirectController.redirectToOriginalUrl);

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

async function startServer() {
  try {
    await database.connect();
    
    app.listen(config.server.port, () => {
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  await database.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await database.close();
  process.exit(0);
});

startServer();
