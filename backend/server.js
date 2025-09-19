const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Load environment configuration
// Try loading .env.local first for development, then fallback to .env
require('dotenv').config({ path: path.join(__dirname, '../.env.local') });
require('dotenv').config({ path: path.join(__dirname, '../.env') });
require('dotenv').config(); // Load from current directory as fallback

const aiController = require('./controllers/aiController');
const diagramController = require('./controllers/diagramController');
const pptController = require('./controllers/pptController');
const vectorController = require('./controllers/vectorController');
const dashboardController = require('./controllers/dashboardController');
const diagramExportController = require('./controllers/diagramExportController');
const logger = require('./utils/logger');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"]
  }
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// AI-specific rate limiting
const aiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // limit each IP to 10 AI requests per 5 minutes
  message: 'AI request limit exceeded, please try again later.'
});
app.use('/api/ai/', aiLimiter);

// File upload configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|pptx|xml/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type'));
    }
  }
});

// Create uploads directory if it doesn't exist
const createUploadsDir = async () => {
  try {
    await fs.access('uploads');
  } catch {
    await fs.mkdir('uploads', { recursive: true });
  }
};

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      ai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured',
      ppt: 'available',
      diagram: 'available'
    }
  });
});

// AI Routes
app.post('/api/ai/analyze-prompt', aiController.analyzePrompt);
app.post('/api/ai/enhance-prompt', aiController.enhancePrompt);
app.post('/api/ai/generate-architecture', aiController.generateArchitecture);
app.get('/api/ai/health', aiController.healthCheck);

// Diagram Routes
app.post('/api/diagrams/create', diagramController.createDiagram);
app.post('/api/diagrams/generate', diagramController.generateDiagram);
app.put('/api/diagrams/:id', diagramController.updateDiagram);
app.get('/api/diagrams/:id', diagramController.getDiagram);

// Diagram Export Routes
app.post('/api/diagrams/save-drawio', diagramExportController.saveDrawioFile);
app.get('/api/diagrams/temp/:fileId', diagramExportController.serveTempFile);
app.post('/api/diagrams/convert', diagramExportController.convertDiagram);
app.post('/api/diagrams/download', diagramExportController.downloadDiagram);
app.post('/api/diagrams/preview', diagramExportController.getPreview);

// Vector Database Routes
app.post('/api/vector/store', vectorController.store);
app.post('/api/vector/search', vectorController.search);
app.post('/api/vector/context', vectorController.getContext);
app.get('/api/vector/stats', vectorController.getStats);

// Dashboard Routes
app.get('/api/dashboard/stats', dashboardController.getDashboardStats);
app.get('/api/dashboard/metrics', dashboardController.getRealTimeMetrics);
app.get('/api/dashboard/export', dashboardController.exportDashboardData);

// PowerPoint Routes
app.post('/api/ppt/generate', pptController.generatePowerPoint);
app.post('/api/ppt/upload-template', upload.single('template'), pptController.uploadTemplate);
app.post('/api/ppt/update-diagram', pptController.updateDiagram);
app.get('/api/ppt/download/:sessionId', pptController.downloadPresentation);

// File upload routes
app.post('/api/upload/template', upload.single('template'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    res.json({
      success: true,
      file: {
        filename: req.file.filename,
        originalname: req.file.originalname,
        size: req.file.size,
        path: req.file.path
      }
    });
  } catch (error) {
    logger.error('File upload error:', error);
    res.status(500).json({ error: 'File upload failed' });
  }
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-session', (sessionId) => {
    socket.join(sessionId);
    logger.info(`Client ${socket.id} joined session ${sessionId}`);
  });
  
  socket.on('diagram-updated', (data) => {
    socket.to(data.sessionId).emit('diagram-changed', data);
  });
  
  socket.on('ai-processing', (data) => {
    socket.to(data.sessionId).emit('ai-status', { 
      status: 'processing', 
      message: data.message 
    });
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'File size too large' });
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Unexpected file field' });
  }
  
  res.status(500).json({ 
    error: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { details: error.message })
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await createUploadsDir();
    
    server.listen(PORT, () => {
      logger.info(`IT Architects Suite Backend running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`CORS origin: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated');
  });
});

startServer();

module.exports = { app, io };
