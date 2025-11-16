/**
 * DSO Service
 *
 * Service voor interactie met de DSO (Digitaal Stelsel Omgevingswet) API
 * Inclusief HAL-links navigatie en data verwerking
 */

const fetch = require('node-fetch');

const DSO_BASE_URL = process.env.DSO_BASE_URL || 'https://service.omgevingswet.overheid.nl';
const DSO_API_KEY = process.env.DSO_API_KEY;

/**
 * Voer een DSO API request uit met HAL ondersteuning
 */
async function dsoRequest(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${DSO_BASE_URL}${endpoint}`;

  const headers = {
    'Accept': 'application/hal+json',
    'Content-Type': 'application/json',
    ...options.headers
  };

  // Voeg API key toe indien beschikbaar
  if (DSO_API_KEY) {
    headers['X-Api-Key'] = DSO_API_KEY;
  }

  console.log(`DSO Request: ${url}`);

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`DSO API Error: ${response.status} - ${errorText}`);
    throw {
      status: response.status,
      message: `DSO API error: ${response.status} ${response.statusText}`
    };
  }

  return await response.json();
}

/**
 * Volg een HAL link naar gerelateerde data
 */
async function followHalLink(halData, linkName) {
  if (!halData._links || !halData._links[linkName]) {
    return null;
  }

  const link = halData._links[linkName];
  const href = link.href;

  if (!href) {
    return null;
  }

  try {
    return await dsoRequest(href);
  } catch (error) {
    console.warn(`Kon HAL link '${linkName}' niet volgen:`, error);
    return null;
  }
}

/**
 * Haal omgevingsplannen op voor een locatie (lat/lon)
 */
async function getPlanningDataForLocation(lat, lon) {
  try {
    // DSO API endpoint voor ruimtelijke plannen op locatie
    // Let op: Dit is een voorbeeld endpoint - de exacte DSO API structuur kan afwijken
    const endpoint = `/publiek/omgevingsdocumenten/api/opvragen/v4/omgevingsdocumenten`;

    // Query parameters voor locatie-gebaseerde zoekopdracht
    const params = new URLSearchParams({
      locatie: `POINT(${lon} ${lat})`, // DSO verwacht WGS84 in lon,lat volgorde
      // documentType: 'omgevingsplan', // Optioneel: filter op documenttype
      pageSize: 20
    });

    const data = await dsoRequest(`${endpoint}?${params.toString()}`);

    // Verwerk de HAL response
    const documents = data._embedded?.omgevingsdocumenten || [];

    // Haal voor elk document de details en annotaties op
    const enrichedDocuments = await Promise.all(
      documents.map(async (doc) => {
        try {
          // Volg HAL links voor meer details
          const annotations = await followHalLink(doc, 'locaties');
          const regels = await followHalLink(doc, 'regels');

          return {
            id: doc.identificatie,
            title: doc.officieleTitel || doc.verkorteTitle || 'Onbekend plan',
            type: doc.soortRegeling?.waarde || 'onbekend',
            status: doc.statusOntwerpbesluit?.waarde || doc.status?.waarde || 'onbekend',
            bevoegdGezag: doc.bevoegdGezag?.naam || 'Onbekend',
            geldigVanaf: doc.geldigVanaf,
            geldigTot: doc.geldigTot,
            citation: doc.citeertitel,
            annotations: parseAnnotations(annotations),
            regulations: parseRegulations(regels),
            _links: doc._links
          };
        } catch (error) {
          console.warn(`Fout bij verwerken document ${doc.identificatie}:`, error);
          return {
            id: doc.identificatie,
            title: doc.officieleTitel || 'Onbekend plan',
            error: 'Details niet beschikbaar'
          };
        }
      })
    );

    return {
      count: enrichedDocuments.length,
      documents: enrichedDocuments,
      _links: data._links
    };

  } catch (error) {
    console.error('Fout bij ophalen planning data:', error);
    throw error;
  }
}

/**
 * Parse annotaties uit DSO response
 */
function parseAnnotations(annotationsData) {
  if (!annotationsData || !annotationsData._embedded) {
    return [];
  }

  const annotations = annotationsData._embedded.locaties || [];

  return annotations.map(annotation => ({
    type: annotation.type,
    naam: annotation.naam,
    groep: annotation.groep?.waarde,
    locatieaanduidingen: annotation.locatieaanduidingen || [],
    waarde: annotation.waarde,
    eenheid: annotation.eenheid,
    symbolisatie: annotation.symbolisatie
  }));
}

/**
 * Parse regels/voorschriften uit DSO response
 */
function parseRegulations(regelsData) {
  if (!regelsData || !regelsData._embedded) {
    return [];
  }

  const regels = regelsData._embedded.regels || [];

  return regels.map(regel => ({
    id: regel.identificatie,
    type: regel.idealisatie?.waarde || 'onbekend',
    omschrijving: regel.omschrijving,
    thema: regel.thema?.waarde,
    artikelStructuur: regel.artikelStructuur,
    inhoud: regel.inhoud || regel.tekst
  }));
}

/**
 * Haal voorschriften op voor een locatie met optionele filters
 */
async function getRegulationsForLocation(lat, lon, filters = []) {
  try {
    // Haal eerst alle planning data op
    const planningData = await getPlanningDataForLocation(lat, lon);

    // Verzamel alle voorschriften uit alle documenten
    let allRegulations = [];

    planningData.documents.forEach(doc => {
      if (doc.regulations && Array.isArray(doc.regulations)) {
        doc.regulations.forEach(reg => {
          allRegulations.push({
            ...reg,
            planId: doc.id,
            planTitle: doc.title,
            bevoegdGezag: doc.bevoegdGezag
          });
        });
      }

      if (doc.annotations && Array.isArray(doc.annotations)) {
        doc.annotations.forEach(ann => {
          allRegulations.push({
            id: `${doc.id}_${ann.type}`,
            type: 'annotatie',
            naam: ann.naam,
            groep: ann.groep,
            waarde: ann.waarde,
            eenheid: ann.eenheid,
            planId: doc.id,
            planTitle: doc.title,
            bevoegdGezag: doc.bevoegdGezag
          });
        });
      }
    });

    // Filter indien filters zijn opgegeven
    if (filters && filters.length > 0) {
      allRegulations = allRegulations.filter(reg => {
        const searchText = `${reg.naam} ${reg.omschrijving} ${reg.thema} ${reg.groep}`.toLowerCase();
        return filters.some(filter => searchText.includes(filter.toLowerCase()));
      });
    }

    // Categoriseer voorschriften
    const categorized = categorizeRegulations(allRegulations);

    return {
      count: allRegulations.length,
      regulations: allRegulations,
      categories: categorized
    };

  } catch (error) {
    console.error('Fout bij ophalen voorschriften:', error);
    throw error;
  }
}

/**
 * Categoriseer voorschriften op basis van type/thema
 */
function categorizeRegulations(regulations) {
  const categories = {
    bouwen: [],
    milieu: [],
    gebruik: [],
    overig: []
  };

  regulations.forEach(reg => {
    const text = `${reg.naam} ${reg.omschrijving} ${reg.thema} ${reg.groep}`.toLowerCase();

    if (text.includes('bouw') || text.includes('hoogte') || text.includes('goot') || text.includes('nok')) {
      categories.bouwen.push(reg);
    } else if (text.includes('milieu') || text.includes('geluid') || text.includes('geur')) {
      categories.milieu.push(reg);
    } else if (text.includes('gebruik') || text.includes('functie') || text.includes('bestemming')) {
      categories.gebruik.push(reg);
    } else {
      categories.overig.push(reg);
    }
  });

  return categories;
}

/**
 * Haal details op van een specifiek plan
 */
async function getPlanDetails(planId) {
  try {
    const endpoint = `/publiek/omgevingsdocumenten/api/opvragen/v4/omgevingsdocumenten/${planId}`;
    const data = await dsoRequest(endpoint);

    return {
      id: data.identificatie,
      title: data.officieleTitel,
      type: data.soortRegeling?.waarde,
      status: data.statusOntwerpbesluit?.waarde || data.status?.waarde,
      bevoegdGezag: data.bevoegdGezag,
      geldigVanaf: data.geldigVanaf,
      geldigTot: data.geldigTot,
      _links: data._links,
      _raw: data
    };

  } catch (error) {
    console.error('Fout bij ophalen plan details:', error);
    throw error;
  }
}

/**
 * Haal GeoJSON op voor kaartweergave
 */
async function getGeoJsonForLocation(lat, lon) {
  try {
    // Haal planning data op
    const planningData = await getPlanningDataForLocation(lat, lon);

    // Converteer naar GeoJSON FeatureCollection
    const features = [];

    // Voeg zoeklocatie toe als punt
    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      properties: {
        type: 'search_location',
        name: 'Gezochte locatie'
      }
    });

    // Probeer voor elk document de geometrie op te halen
    for (const doc of planningData.documents) {
      try {
        if (doc._links && doc._links.geometrie) {
          const geometrieData = await followHalLink(doc, 'geometrie');

          if (geometrieData && geometrieData.geometry) {
            features.push({
              type: 'Feature',
              geometry: geometrieData.geometry,
              properties: {
                type: 'plan_area',
                planId: doc.id,
                title: doc.title,
                bevoegdGezag: doc.bevoegdGezag,
                status: doc.status
              }
            });
          }
        }
      } catch (error) {
        console.warn(`Kon geometrie niet ophalen voor plan ${doc.id}:`, error);
      }
    }

    return {
      type: 'FeatureCollection',
      features: features
    };

  } catch (error) {
    console.error('Fout bij ophalen GeoJSON:', error);
    // Geef in ieder geval de zoeklocatie terug
    return {
      type: 'FeatureCollection',
      features: [{
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [lon, lat]
        },
        properties: {
          type: 'search_location',
          name: 'Gezochte locatie'
        }
      }]
    };
  }
}

module.exports = {
  getPlanningDataForLocation,
  getRegulationsForLocation,
  getPlanDetails,
  getGeoJsonForLocation,
  dsoRequest,
  followHalLink
};
