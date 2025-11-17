/**
 * Mock Data voor Development en Testing
 *
 * Gebruik dit om de applicatie te testen zonder DSO API key
 */

const mockLocations = {
  'haarlem': {
    display_name: 'Plein 1945 1, 2034KG Haarlem',
    street: 'Plein 1945',
    house_number: '1',
    postcode: '2034KG',
    city: 'Haarlem',
    municipality: 'Haarlem',
    province: 'Noord-Holland',
    lat: 52.391265,
    lon: 4.628633,
    x: 103456,
    y: 498765
  },
  'utrecht': {
    display_name: 'Oudegracht 1, 3511AA Utrecht',
    street: 'Oudegracht',
    house_number: '1',
    postcode: '3511AA',
    city: 'Utrecht',
    municipality: 'Utrecht',
    province: 'Utrecht',
    lat: 52.091904,
    lon: 5.119158,
    x: 135790,
    y: 455678
  },
  'amsterdam': {
    display_name: 'Dam 1, 1012JS Amsterdam',
    street: 'Dam',
    house_number: '1',
    postcode: '1012JS',
    city: 'Amsterdam',
    municipality: 'Amsterdam',
    province: 'Noord-Holland',
    lat: 52.373169,
    lon: 4.891030,
    x: 121234,
    y: 487890
  }
}

const mockPlanningData = {
  count: 2,
  documents: [
    {
      id: 'nl.imow-gm0392.regeltekst.2024.001',
      title: 'Omgevingsplan Haarlem 2024',
      type: 'omgevingsplan',
      status: 'vastgesteld',
      bevoegdGezag: 'Gemeente Haarlem',
      geldigVanaf: '2024-01-01',
      geldigTot: null,
      citation: 'Omgevingsplan Haarlem',
      annotations: [
        {
          type: 'bouwhoogte',
          naam: 'Maximale bouwhoogte',
          groep: 'Bouwen',
          waarde: '12',
          eenheid: 'meter',
          locatieaanduidingen: ['gebiedsaanduiding_001']
        },
        {
          type: 'goothoogte',
          naam: 'Maximale goothoogte',
          groep: 'Bouwen',
          waarde: '9',
          eenheid: 'meter',
          locatieaanduidingen: ['gebiedsaanduiding_001']
        },
        {
          type: 'bebouwingspercentage',
          naam: 'Maximum bebouwingspercentage',
          groep: 'Bouwen',
          waarde: '60',
          eenheid: '%',
          locatieaanduidingen: ['gebiedsaanduiding_001']
        },
        {
          type: 'geluid',
          naam: 'Geluidzone industrieterrein',
          groep: 'Milieu',
          waarde: '50',
          eenheid: 'dB',
          locatieaanduidingen: ['gebiedsaanduiding_002']
        }
      ],
      regulations: [
        {
          id: 'regel_001',
          type: 'regel',
          omschrijving: 'Bouwhoogte woningen',
          thema: 'Bouwen',
          inhoud: 'De bouwhoogte van hoofdgebouwen bedraagt maximaal 12 meter, gemeten vanaf peil tot aan de bovenkant van de goot of het dak indien daar geen goot aanwezig is.'
        },
        {
          id: 'regel_002',
          type: 'regel',
          omschrijving: 'Erfafscheiding',
          thema: 'Bouwen',
          inhoud: 'De hoogte van een erfafscheiding bedraagt maximaal 2 meter.'
        },
        {
          id: 'regel_003',
          type: 'regel',
          omschrijving: 'Parkeren',
          thema: 'Gebruik',
          inhoud: 'Per woning dient minimaal 1 parkeerplaats op eigen terrein te worden gerealiseerd.'
        }
      ],
      _links: {
        self: { href: '/omgevingsdocumenten/nl.imow-gm0392.regeltekst.2024.001' }
      }
    },
    {
      id: 'nl.imow-pv27.verordening.2024.001',
      title: 'Omgevingsverordening Noord-Holland',
      type: 'omgevingsverordening',
      status: 'vastgesteld',
      bevoegdGezag: 'Provincie Noord-Holland',
      geldigVanaf: '2024-01-01',
      geldigTot: null,
      citation: 'Omgevingsverordening NH',
      annotations: [
        {
          type: 'bodem',
          naam: 'Bodemkwaliteit',
          groep: 'Milieu',
          waarde: 'Wonen',
          locatieaanduidingen: ['gebiedsaanduiding_003']
        }
      ],
      regulations: [
        {
          id: 'regel_prov_001',
          type: 'regel',
          omschrijving: 'Waterbeheer',
          thema: 'Milieu',
          inhoud: 'Bij hemelwaterafvoer dient zoveel mogelijk gebruik te worden gemaakt van infiltratie op eigen terrein.'
        }
      ],
      _links: {
        self: { href: '/omgevingsdocumenten/nl.imow-pv27.verordening.2024.001' }
      }
    }
  ],
  _links: {
    self: { href: '/omgevingsdocumenten' }
  }
}

const mockRegulations = {
  count: 8,
  regulations: [
    {
      id: 'regel_001',
      type: 'regel',
      naam: 'Bouwhoogte woningen',
      omschrijving: 'Bouwhoogte woningen',
      thema: 'Bouwen',
      inhoud: 'De bouwhoogte van hoofdgebouwen bedraagt maximaal 12 meter.',
      planId: 'nl.imow-gm0392.regeltekst.2024.001',
      planTitle: 'Omgevingsplan Haarlem 2024',
      bevoegdGezag: 'Gemeente Haarlem'
    },
    {
      id: 'ann_001',
      type: 'annotatie',
      naam: 'Maximale bouwhoogte',
      groep: 'Bouwen',
      waarde: '12',
      eenheid: 'meter',
      planId: 'nl.imow-gm0392.regeltekst.2024.001',
      planTitle: 'Omgevingsplan Haarlem 2024',
      bevoegdGezag: 'Gemeente Haarlem'
    },
    {
      id: 'ann_002',
      type: 'annotatie',
      naam: 'Maximale goothoogte',
      groep: 'Bouwen',
      waarde: '9',
      eenheid: 'meter',
      planId: 'nl.imow-gm0392.regeltekst.2024.001',
      planTitle: 'Omgevingsplan Haarlem 2024',
      bevoegdGezag: 'Gemeente Haarlem'
    },
    {
      id: 'ann_003',
      type: 'annotatie',
      naam: 'Maximum bebouwingspercentage',
      groep: 'Bouwen',
      waarde: '60',
      eenheid: '%',
      planId: 'nl.imow-gm0392.regeltekst.2024.001',
      planTitle: 'Omgevingsplan Haarlem 2024',
      bevoegdGezag: 'Gemeente Haarlem'
    },
    {
      id: 'ann_004',
      type: 'annotatie',
      naam: 'Geluidzone industrieterrein',
      groep: 'Milieu',
      waarde: '50',
      eenheid: 'dB',
      planId: 'nl.imow-gm0392.regeltekst.2024.001',
      planTitle: 'Omgevingsplan Haarlem 2024',
      bevoegdGezag: 'Gemeente Haarlem'
    },
    {
      id: 'regel_002',
      type: 'regel',
      naam: 'Erfafscheiding',
      omschrijving: 'Erfafscheiding',
      thema: 'Bouwen',
      inhoud: 'De hoogte van een erfafscheiding bedraagt maximaal 2 meter.',
      planId: 'nl.imow-gm0392.regeltekst.2024.001',
      planTitle: 'Omgevingsplan Haarlem 2024',
      bevoegdGezag: 'Gemeente Haarlem'
    },
    {
      id: 'regel_003',
      type: 'regel',
      naam: 'Parkeren',
      omschrijving: 'Parkeren',
      thema: 'Gebruik',
      inhoud: 'Per woning dient minimaal 1 parkeerplaats op eigen terrein te worden gerealiseerd.',
      planId: 'nl.imow-gm0392.regeltekst.2024.001',
      planTitle: 'Omgevingsplan Haarlem 2024',
      bevoegdGezag: 'Gemeente Haarlem'
    },
    {
      id: 'regel_prov_001',
      type: 'regel',
      naam: 'Waterbeheer',
      omschrijving: 'Waterbeheer',
      thema: 'Milieu',
      inhoud: 'Bij hemelwaterafvoer dient zoveel mogelijk gebruik te worden gemaakt van infiltratie op eigen terrein.',
      planId: 'nl.imow-pv27.verordening.2024.001',
      planTitle: 'Omgevingsverordening Noord-Holland',
      bevoegdGezag: 'Provincie Noord-Holland'
    }
  ],
  categories: {
    bouwen: [
      {
        id: 'regel_001',
        type: 'regel',
        naam: 'Bouwhoogte woningen',
        omschrijving: 'Bouwhoogte woningen',
        thema: 'Bouwen',
        planTitle: 'Omgevingsplan Haarlem 2024'
      },
      {
        id: 'ann_001',
        type: 'annotatie',
        naam: 'Maximale bouwhoogte',
        waarde: '12',
        eenheid: 'meter',
        planTitle: 'Omgevingsplan Haarlem 2024'
      },
      {
        id: 'ann_002',
        type: 'annotatie',
        naam: 'Maximale goothoogte',
        waarde: '9',
        eenheid: 'meter',
        planTitle: 'Omgevingsplan Haarlem 2024'
      },
      {
        id: 'ann_003',
        type: 'annotatie',
        naam: 'Maximum bebouwingspercentage',
        waarde: '60',
        eenheid: '%',
        planTitle: 'Omgevingsplan Haarlem 2024'
      },
      {
        id: 'regel_002',
        type: 'regel',
        naam: 'Erfafscheiding',
        thema: 'Bouwen',
        planTitle: 'Omgevingsplan Haarlem 2024'
      }
    ],
    milieu: [
      {
        id: 'ann_004',
        type: 'annotatie',
        naam: 'Geluidzone industrieterrein',
        waarde: '50',
        eenheid: 'dB',
        planTitle: 'Omgevingsplan Haarlem 2024'
      },
      {
        id: 'regel_prov_001',
        type: 'regel',
        naam: 'Waterbeheer',
        thema: 'Milieu',
        planTitle: 'Omgevingsverordening Noord-Holland'
      }
    ],
    gebruik: [
      {
        id: 'regel_003',
        type: 'regel',
        naam: 'Parkeren',
        thema: 'Gebruik',
        planTitle: 'Omgevingsplan Haarlem 2024'
      }
    ],
    overig: []
  }
}

const mockGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [4.628633, 52.391265]
      },
      properties: {
        type: 'search_location',
        name: 'Gezochte locatie'
      }
    },
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[
          [4.626, 52.390],
          [4.631, 52.390],
          [4.631, 52.393],
          [4.626, 52.393],
          [4.626, 52.390]
        ]]
      },
      properties: {
        type: 'plan_area',
        planId: 'nl.imow-gm0392.regeltekst.2024.001',
        title: 'Omgevingsplan Haarlem 2024',
        bevoegdGezag: 'Gemeente Haarlem',
        status: 'vastgesteld'
      }
    }
  ]
}

module.exports = {
  mockLocations,
  mockPlanningData,
  mockRegulations,
  mockGeoJSON
}
