# 🔑 DSO API Key Verkrijgen

## Waarom heb je een API key nodig?

De DSO (Digitaal Stelsel Omgevingswet) API vereist voor sommige endpoints een API key. Zonder key:
- ✅ PDOK geocoding werkt volledig
- ⚠️ DSO endpoints geven mogelijk 401 Unauthorized errors
- ❌ Volledige omgevingsplan data niet beschikbaar

## Stap-voor-stap: API Key aanvragen

### Stap 1: Registreer bij DSO

1. Ga naar **https://aandeslagmetdeomgevingswet.nl/**
2. Klik op **"Registreren"** of **"Inloggen"**
3. Maak een account aan met:
   - Email adres
   - Wachtwoord
   - Organisatie gegevens (indien van toepassing)

### Stap 2: Vraag API toegang aan

1. Log in op je account
2. Ga naar **"Developer Portal"** of **"API Toegang"**
3. Vraag toegang aan tot:
   - **Omgevingsdocumenten API**
   - **Locatie-based queries**
4. Vul het aanvraagformulier in:
   - Doel: "Raadplegen omgevingsplannen voor ontwikkeling/onderzoek"
   - Gebruik: "Web applicatie voor planologische informatie"

### Stap 3: Ontvang je API Key

Na goedkeuring (meestal binnen 1-2 werkdagen):
1. Je ontvangt een email met je API key
2. Of je vindt de key in je account dashboard

De key ziet er ongeveer zo uit:
```
abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
```

### Stap 4: Configureer de applicatie

1. **Open `.env` file** in de DSO project root:
   ```powershell
   notepad .env
   ```

2. **Zoek deze regel:**
   ```
   DSO_API_KEY=your_dso_api_key_here
   ```

3. **Vervang door je echte key:**
   ```
   DSO_API_KEY=abc123def456ghi789jkl012mno345pqr678stu901vwx234yz
   ```

4. **Sla op en sluit de editor**

### Stap 5: Test de API

Run het test script:
```powershell
node test-apis.js
```

Je zou nu moeten zien:
```
📊 Test Samenvatting
==================================================
PDOK Geocoding: ✅ WERKT
DSO API:        ✅ WERKT
```

---

## Alternatieve API toegang

Als de bovenstaande weg niet werkt, probeer:

### Developer.overheid.nl

1. Ga naar **https://developer.overheid.nl/**
2. Zoek naar "Omgevingswet API"
3. Volg de instructies voor API toegang

### API Documentatie

- **DSO Developers**: https://aandeslagmetdeomgevingswet.nl/ontwikkelaarsportaal
- **API Specificatie**: https://developer.overheid.nl/
- **Technische docs**: https://iplo.nl/digitaal-stelsel/aansluiten/standaarden/

---

## Zonder API Key gebruiken

Je kunt de applicatie **beperkt** gebruiken zonder API key:

### Wat werkt:
- ✅ PDOK geocoding (adres → coördinaten)
- ✅ Kaart visualisatie
- ✅ Frontend UI

### Wat werkt mogelijk niet:
- ❌ DSO omgevingsdocumenten ophalen
- ❌ Voorschriften en annotaties
- ❌ GeoJSON plangebieden

### Test zonder key:

1. Laat `.env` staan zoals die is:
   ```
   DSO_API_KEY=your_dso_api_key_here
   ```

2. Start de app:
   ```powershell
   npm run dev
   ```

3. Probeer een adres:
   - PDOK geocoding zou moeten werken
   - DSO calls geven errors (verwacht)

---

## Troubleshooting

### "401 Unauthorized" error

**Oorzaak:** API key is ongeldig of niet correct geconfigureerd

**Oplossing:**
1. Check `.env` file (niet `.env.example`!)
2. Geen spaties rond de `=`
3. Geen quotes rond de key
4. Correcte key gekopieerd (hele string)

Voorbeeld GOED:
```
DSO_API_KEY=abc123xyz
```

Voorbeeld FOUT:
```
DSO_API_KEY = "abc123xyz"    # Spaties en quotes!
DSO_API_KEY=abc123            # Onvolledige key
```

### "403 Forbidden" error

**Oorzaak:** Je account heeft geen toegang tot dit endpoint

**Oplossing:**
- Vraag uitgebreide API toegang aan
- Check of je account is goedgekeurd
- Mogelijk rate limit bereikt (wacht even)

### API key werkt niet

**Check:**
1. Is de key verlopen? (sommige keys hebben expiration)
2. Run `node test-apis.js` om exact te zien welke endpoints falen
3. Check DSO status: https://www.omgevingswet.overheid.nl/

---

## Rate Limits

DSO API heeft waarschijnlijk rate limits:
- **Zonder key**: Zeer beperkt
- **Met key**: Afhankelijk van je account type

Als je rate limit bereikt:
- Wacht 5-10 minuten
- Implementeer caching (zie `IMPLEMENTATIE_GIDS.md`)
- Vraag hogere limits aan bij DSO

---

## Kosten

De DSO API is momenteel **gratis** voor:
- Onderzoek
- Ontwikkeling
- Niet-commercieel gebruik

Voor commercieel gebruik, check de voorwaarden op:
https://aandeslagmetdeomgevingswet.nl/

---

## Hulp nodig?

- **DSO Support**: Via aandeslagmetdeomgevingswet.nl
- **Developer Forum**: https://developer.overheid.nl/
- **GitHub Issues**: Voor applicatie-specifieke vragen

---

**Succes met je API key! 🚀**
