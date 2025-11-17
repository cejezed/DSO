/**
 * DSO API Routes
 *
 * Endpoints voor het ophalen van omgevingsplan data via de DSO API
 * Inclusief HAL-links navigatie en annotaties verwerking
 */

const express = require('express');
const router = express.Router();
const dsoService = require('../services/dsoService');
const { mockPlanningData, mockRegulations, mockGeoJSON } = require('../mockData');

const USE_MOCK_DATA = process.env.USE_MOCK_DATA === 'true';

/**
 * POST /api/dso/planning-data
 * Haal omgevingsplan data op voor een locatie
 *
 * Body: {
 *   "lat": 52.xxx,
 *   "lon": 4.xxx
 * }
 */
router.post('/planning-data', async (req, res) => {
  try {
    const { lat, lon } = req.body;

    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Latitude en longitude zijn verplicht'
      });
    }

    console.log(`Ophalen planning data voor locatie: ${lat}, ${lon}`);

    // Mock data mode voor testing zonder DSO API key
    if (USE_MOCK_DATA) {
      console.log('🎭 Using MOCK DATA mode');
      return res.json({
        success: true,
        location: { lat, lon },
        data: mockPlanningData,
        mock: true
      });
    }

    // Haal omgevingsplannen op voor deze locatie
    const planningData = await dsoService.getPlanningDataForLocation(lat, lon);

    res.json({
      success: true,
      location: { lat, lon },
      data: planningData
    });

  } catch (error) {
    console.error('DSO API fout:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Fout bij ophalen omgevingsplan data'
    });
  }
});

/**
 * POST /api/dso/regulations
 * Haal specifieke voorschriften en annotaties op
 *
 * Body: {
 *   "lat": 52.xxx,
 *   "lon": 4.xxx,
 *   "filters": ["bouwhoogte", "goothoogte", "milieu"]
 * }
 */
router.post('/regulations', async (req, res) => {
  try {
    const { lat, lon, filters } = req.body;

    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Latitude en longitude zijn verplicht'
      });
    }

    console.log(`Ophalen voorschriften voor locatie: ${lat}, ${lon}`);
    console.log(`Filters: ${filters ? filters.join(', ') : 'geen'}`);

    // Mock data mode
    if (USE_MOCK_DATA) {
      console.log('🎭 Using MOCK DATA mode');
      let filteredData = { ...mockRegulations };

      // Apply filters if provided
      if (filters && filters.length > 0) {
        filteredData.regulations = mockRegulations.regulations.filter(reg => {
          const searchText = `${reg.naam} ${reg.omschrijving} ${reg.thema} ${reg.groep}`.toLowerCase();
          return filters.some(filter => searchText.includes(filter.toLowerCase()));
        });
        filteredData.count = filteredData.regulations.length;
      }

      return res.json({
        success: true,
        location: { lat, lon },
        regulations: filteredData,
        mock: true
      });
    }

    // Haal voorschriften op
    const regulations = await dsoService.getRegulationsForLocation(lat, lon, filters);

    res.json({
      success: true,
      location: { lat, lon },
      regulations: regulations
    });

  } catch (error) {
    console.error('Voorschriften fout:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Fout bij ophalen voorschriften'
    });
  }
});

/**
 * GET /api/dso/plan/:planId
 * Haal details van een specifiek plan op
 */
router.get('/plan/:planId', async (req, res) => {
  try {
    const { planId } = req.params;

    console.log(`Ophalen plan details: ${planId}`);

    const planDetails = await dsoService.getPlanDetails(planId);

    res.json({
      success: true,
      plan: planDetails
    });

  } catch (error) {
    console.error('Plan details fout:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Fout bij ophalen plan details'
    });
  }
});

/**
 * POST /api/dso/geojson
 * Haal GeoJSON data op voor kaartweergave
 *
 * Body: {
 *   "lat": 52.xxx,
 *   "lon": 4.xxx
 * }
 */
router.post('/geojson', async (req, res) => {
  try {
    const { lat, lon } = req.body;

    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Latitude en longitude zijn verplicht'
      });
    }

    console.log(`Ophalen GeoJSON voor locatie: ${lat}, ${lon}`);

    // Mock data mode
    if (USE_MOCK_DATA) {
      console.log('🎭 Using MOCK DATA mode');
      // Update coordinates in mock data
      const geojson = JSON.parse(JSON.stringify(mockGeoJSON)); // Deep clone
      geojson.features[0].geometry.coordinates = [lon, lat];

      return res.json({
        success: true,
        geojson: geojson,
        mock: true
      });
    }

    const geojson = await dsoService.getGeoJsonForLocation(lat, lon);

    res.json({
      success: true,
      geojson: geojson
    });

  } catch (error) {
    console.error('GeoJSON fout:', error);
    res.status(error.status || 500).json({
      error: error.message || 'Fout bij ophalen GeoJSON data'
    });
  }
});

module.exports = router;
