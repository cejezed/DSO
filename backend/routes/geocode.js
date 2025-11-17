/**
 * Geocoding Routes
 *
 * Endpoints voor het geocoderen van Nederlandse adressen via PDOK Locatieserver
 */

const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const PDOK_URL = process.env.PDOK_GEOCODE_URL || 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/free';

/**
 * POST /api/geocode
 * Geocodeer een adres naar coördinaten
 *
 * Body: { "address": "Plein 1945 1, Haarlem" }
 * Response: { "lat": 52.xxx, "lon": 4.xxx, "display_name": "...", ... }
 */
router.post('/', async (req, res) => {
  try {
    const { address } = req.body;

    if (!address || address.trim() === '') {
      return res.status(400).json({
        error: 'Adres is verplicht'
      });
    }

    console.log(`Geocoding adres: ${address}`);

    // Query PDOK Locatieserver
    const url = `${PDOK_URL}?q=${encodeURIComponent(address)}&fq=type:adres&rows=5`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`PDOK API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Verwerk PDOK response
    if (!data.response || !data.response.docs || data.response.docs.length === 0) {
      return res.status(404).json({
        error: 'Geen resultaten gevonden voor dit adres',
        suggestions: []
      });
    }

    // Transformeer resultaten naar een handig formaat
    const results = data.response.docs.map(doc => ({
      display_name: doc.weergavenaam,
      street: doc.straatnaam,
      house_number: doc.huisnummer,
      postcode: doc.postcode,
      city: doc.woonplaatsnaam,
      municipality: doc.gemeentenaam,
      province: doc.provincienaam,
      lat: doc.centroide_ll ? parseFloat(doc.centroide_ll.split(' ')[0].replace('POINT(', '')) : null,
      lon: doc.centroide_ll ? parseFloat(doc.centroide_ll.split(' ')[1].replace(')', '')) : null,
      // RD coördinaten (Rijksdriehoek)
      x: doc.centroide_rd ? parseFloat(doc.centroide_rd.split(' ')[0].replace('POINT(', '')) : null,
      y: doc.centroide_rd ? parseFloat(doc.centroide_rd.split(' ')[1].replace(')', '')) : null,
      score: doc.score,
      type: doc.type,
      id: doc.id
    }));

    // Wissel lat/lon (PDOK geeft lon/lat in centroide_ll)
    results.forEach(r => {
      if (r.lat && r.lon) {
        const temp = r.lat;
        r.lat = r.lon;
        r.lon = temp;
      }
    });

    console.log(`Gevonden: ${results.length} resultaten`);

    res.json({
      success: true,
      count: results.length,
      results: results
    });

  } catch (error) {
    console.error('Geocoding fout:', error);
    res.status(500).json({
      error: 'Fout bij geocoding: ' + error.message
    });
  }
});

/**
 * GET /api/geocode/reverse
 * Reverse geocoding: coördinaten naar adres
 *
 * Query: ?lat=52.xxx&lon=4.xxx
 */
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        error: 'Latitude en longitude zijn verplicht'
      });
    }

    console.log(`Reverse geocoding: ${lat}, ${lon}`);

    // PDOK reverse geocoding via X/Y parameter
    const url = `${PDOK_URL}?lat=${lat}&lon=${lon}&fq=type:adres&rows=1`;

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`PDOK API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.response || !data.response.docs || data.response.docs.length === 0) {
      return res.status(404).json({
        error: 'Geen adres gevonden op deze locatie'
      });
    }

    const doc = data.response.docs[0];
    const result = {
      display_name: doc.weergavenaam,
      street: doc.straatnaam,
      house_number: doc.huisnummer,
      postcode: doc.postcode,
      city: doc.woonplaatsnaam,
      municipality: doc.gemeentenaam,
      province: doc.provincienaam
    };

    res.json({
      success: true,
      result: result
    });

  } catch (error) {
    console.error('Reverse geocoding fout:', error);
    res.status(500).json({
      error: 'Fout bij reverse geocoding: ' + error.message
    });
  }
});

module.exports = router;
