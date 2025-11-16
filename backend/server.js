/**
 * Dutch Planning Regulations - Backend Server
 *
 * Deze Express server biedt endpoints voor:
 * - Geocoding via PDOK Locatieserver
 * - Opvragen DSO omgevingsplan data
 * - Verwerken HAL-responses
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const geocodeRoutes = require('./routes/geocode');
const dsoRoutes = require('./routes/dso');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/geocode', geocodeRoutes);
app.use('/api/dso', dsoRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: {
      hasDsoApiKey: !!process.env.DSO_API_KEY,
      pdokUrl: process.env.PDOK_GEOCODE_URL
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Er is een fout opgetreden',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Endpoint niet gevonden',
      status: 404
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Backend server draait op http://localhost:${PORT}`);
  console.log(`📍 PDOK Geocoding: ${process.env.PDOK_GEOCODE_URL || 'Niet geconfigureerd'}`);
  console.log(`🏛️  DSO API: ${process.env.DSO_BASE_URL || 'Niet geconfigureerd'}`);
  console.log(`🔑 DSO API Key: ${process.env.DSO_API_KEY ? 'Geconfigureerd ✓' : 'Niet geconfigureerd ✗'}\n`);
});

module.exports = app;
