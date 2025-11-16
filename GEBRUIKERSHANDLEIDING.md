# 📘 Gebruikershandleiding - Dutch Planning Regulations App

## Inhoudsopgave
1. [Aan de slag](#aan-de-slag)
2. [Stap voor stap gebruik](#stap-voor-stap-gebruik)
3. [Functies uitgelegd](#functies-uitgelegd)
4. [Tips & Tricks](#tips--tricks)
5. [Veelgestelde vragen](#veelgestelde-vragen)

---

## Aan de slag

### Wat doet deze app?

De Dutch Planning Regulations App helpt je om snel en gemakkelijk te achterhalen welke bouwvoorschriften, milieuregels en andere omgevingsplan bepalingen gelden voor een specifieke locatie in Nederland.

### Voor wie is deze app?

- **Architecten** - Check bouwhoogte, goothoogte en andere bouwvoorschriften
- **Projectontwikkelaars** - Verken bouwmogelijkheden op een locatie
- **Makelaars** - Informeer klanten over planologische situatie
- **Particulieren** - Ontdek wat je mag bouwen op je eigen perceel
- **Gemeenteambtenaren** - Snelle referentie voor omgevingsplannen

---

## Stap voor stap gebruik

### Stap 1: Open de applicatie

Navigeer in je browser naar: `http://localhost:5173`

Je ziet het hoofdscherm met:
- Links: Zoekveld en resultaten
- Rechts: Interactieve kaart van Nederland

### Stap 2: Zoek een adres

1. Typ een adres in het zoekveld, bijvoorbeeld:
   - `Plein 1945 1, Haarlem`
   - `Oudegracht 1, Utrecht`
   - `Dam 1, Amsterdam`

2. Druk op **Enter** of klik op de **Zoek** knop

3. De app zoekt het adres via PDOK Locatieserver

### Stap 3: Selecteer het juiste adres

Als er meerdere resultaten zijn:
- Er verschijnt een lijst met mogelijke adressen
- Klik op het correcte adres om deze te selecteren
- Bij één resultaat wordt deze automatisch geselecteerd

### Stap 4: Bekijk de resultaten

Na selectie worden automatisch opgehaald:

#### 📍 Locatie informatie
- Volledig adres
- Coördinaten (lat/lon)
- Marker op de kaart

#### 📋 Omgevingsdocumenten
Voor elke locatie zie je:
- **Titel** van het plan
- **Status** (vastgesteld, ontwerp, etc.)
- **Type** (omgevingsplan, verordening, etc.)
- **Bevoegd gezag** (welke gemeente/provincie)
- **Geldig vanaf** datum
- Aantal **annotaties** en **voorschriften**

Klik op een document om **Details te bekijken** in een popup.

#### 📖 Voorschriften & Annotaties
Alle relevante regels voor deze locatie:
- Bouwvoorschriften (hoogte, oppervlakte, etc.)
- Milieuregels (geluid, geur, etc.)
- Gebruiksregels (functie, bestemming)
- Overige bepalingen

### Stap 5: Filter voorschriften

Gebruik de **categorie filters** om te focussen op specifieke regels:

- 🏗️ **Bouwen** - Bouwhoogte, goothoogte, nokrichting, etc.
- 🌱 **Milieu** - Geluidsregels, geurcontouren, etc.
- 🏠 **Gebruik** - Functies, bestemmingen, activiteiten
- 📋 **Overig** - Alle andere voorschriften

**Tips:**
- Klik op meerdere filters om ze te combineren
- Klik **✕ Wis filters** om alle regels weer te tonen
- Het getal tussen haakjes toont hoeveel items in die categorie zitten

### Stap 6: Bekijk op de kaart

De kaart rechts toont:
- **Rode marker** - Je geselecteerde adres
- **Blauwe vlakken** - Plangebieden die van toepassing zijn
- **Popups** - Klik op vlakken voor plan informatie

**Kaart controls:**
- **Zoom** - Scroll of gebruik +/- knoppen
- **Pan** - Sleep de kaart met je muis
- **Schaal** - Onderaan zie je de schaal indicator

### Stap 7: Exporteer naar PDF

Om een rapport te downloaden:

1. Scroll naar beneden
2. Klik op **📄 Exporteer als PDF**
3. Een PDF wordt automatisch gedownload met:
   - Locatie informatie
   - Alle omgevingsdocumenten
   - Voorschriften in tabel format
   - Samenvatting per categorie

**PDF bestandsnaam format:**
`omgevingsplan_[STAD]_[DATUM].pdf`

Bijvoorbeeld: `omgevingsplan_Haarlem_2024-01-15.pdf`

---

## Functies uitgelegd

### Adres zoeken

**Ondersteunde formaten:**
- Volledige adressen: `Straatnaam 1, Plaatsnaam`
- Met postcode: `1234AB 1` of `1234 AB 1`
- Alleen postcode: `1234AB` (geeft lijst met adressen)
- Plaatsnaam: `Haarlem` (geeft lijst met adressen in die plaats)

**Zoek tips:**
- Gebruik correcte spelling
- Voeg huisnummer toe voor exacte match
- Bij geen resultaten: probeer zonder toevoegingen (a, bis, etc.)

### Kaart navigatie

**Functionaliteit:**
- **Marker** - Toont exact zoekpunt
- **Planvlakken** - Kleuren tonen verschillende plannen
- **Popups** - Informatie per plangebied
- **Layers** - Meerdere plannen kunnen overlappen

**Legenda:**
- 🔴 Rode marker = Zoeklocatie
- 🔵 Blauw vlak = Plangebied
- 🟠 Oranje = Speciale gebieden (indien aanwezig)

### Document details

Klik op **"Details bekijken →"** bij een document voor:

**Algemene informatie:**
- Volledige titel
- Officiële status
- Bevoegd gezag contactinformatie
- Geldigheidsdatums
- Citeertitel (officiële verwijzing)

**Annotaties lijst:**
- Bouwmaten (hoogtes, oppervlaktes)
- Afstanden en percentages
- Materiaalvoorschriften
- Kleur- en vormregels

**Voorschriften lijst:**
- Volledige regeltekst
- Thematische indeling
- Artikelstructuur
- Juridische context

### Filters

**Hoe werken filters?**

1. **Standaard** - Alle voorschriften worden getoond
2. **Actief filter** - Alleen items uit geselecteerde categorieën
3. **Meerdere filters** - Combineer categorieën (bouwen + milieu)
4. **Wis filters** - Terug naar alle voorschriften

**Auto-categorisatie:**

De app categoriseert automatisch op basis van trefwoorden:
- "bouw", "hoogte", "goot" → Bouwen
- "milieu", "geluid", "geur" → Milieu
- "gebruik", "functie", "bestemming" → Gebruik
- Overige → Overig

### PDF Export

**Wat staat er in de PDF?**

1. **Header**
   - Titel: "Omgevingsplan Rapportage"
   - Datum van export
   - Locatie informatie

2. **Documenten sectie**
   - Lijst van alle gevonden plannen
   - Details per plan (type, status, bevoegd gezag)

3. **Voorschriften tabel**
   - Type (Annotatie/Voorschrift)
   - Naam/omschrijving
   - Waarde (indien van toepassing)
   - Bij welk plan het hoort

4. **Samenvatting**
   - Telling per categorie
   - Totaal aantal items

5. **Footer**
   - Paginanummering
   - Timestamp

**PDF gebruik:**
- Opslaan voor archief
- Delen met opdrachtgevers
- Bijvoegen bij vergunningaanvragen
- Printen voor bespreking

---

## Tips & Tricks

### 🎯 Efficiënt zoeken

**Tip 1: Gebruik filters vroeg**
Filter direct op wat je zoekt (bijv. alleen Bouwen) om sneller relevante info te vinden.

**Tip 2: Vergelijk meerdere locaties**
Open meerdere browser tabs om verschillende adressen naast elkaar te bekijken.

**Tip 3: Bookmark interessante locaties**
Gebruik browser bookmarks voor adressen die je vaker nodig hebt.

### 🗺️ Kaart gebruik

**Tip 4: Zoom in voor detail**
Bij overlappende plangebieden: zoom ver in om grenzen te zien.

**Tip 5: Screenshot de kaart**
Gebruik OS screenshot functie om kaartbeeld op te slaan.

**Tip 6: Check de schaal**
Onderaan de kaart zie je de schaal - belangrijk voor afstanden schatten.

### 📄 Document analyse

**Tip 7: Begin bij status**
Kijk eerst naar de status: "vastgesteld" is van kracht, "ontwerp" nog niet.

**Tip 8: Check geldigheid**
Let op "Geldig vanaf" en "Geldig tot" datums - niet alle plannen zijn actueel.

**Tip 9: Bevoegd gezag**
Weet bij welke instantie je moet zijn voor vragen of vergunningen.

### 📊 Exporteren

**Tip 10: Export bij veel data**
Bij 10+ voorschriften: gebruik PDF i.p.v. screenshots - beter leesbaar.

**Tip 11: Voeg notities toe**
Open de PDF in een editor (Adobe, Preview) en voeg je eigen aantekeningen toe.

**Tip 12: Archiveer met datum**
PDFs hebben datum in de naam - bewaar oude versies bij planwijzigingen.

---

## Veelgestelde vragen

### Algemeen

**Q: Is deze app gratis te gebruiken?**
A: Ja, de app is open-source. Voor productiegebruik heb je wel een DSO API key nodig.

**Q: Werkt de app in mijn regio?**
A: Ja, de app werkt voor heel Nederland waar DSO data beschikbaar is.

**Q: Hoe actueel is de data?**
A: Data komt direct van het DSO - zo actueel als de officiële bron.

**Q: Kan ik de app offline gebruiken?**
A: Nee, de app heeft internetverbinding nodig voor DSO en PDOK API's.

### Zoeken & Resultaten

**Q: Waarom vind ik geen resultaten?**
A: Mogelijke redenen:
- Typ fout in adres
- Adres bestaat niet in PDOK database
- Zeer nieuwe adressen kunnen nog niet geïndexeerd zijn
- Probeer alleen postcode of plaatsnaam

**Q: Ik zie meerdere dezelfde adressen?**
A: Dit kan bij:
- Appartementen in hetzelfde gebouw
- Hoofd- en bijgebouwen
- Verschillende postcodes voor zelfde straat
Kies het adres met het juiste huisnummer.

**Q: Geen omgevingsdocumenten gevonden?**
A: Mogelijk:
- Gemeente heeft nog geen digitaal omgevingsplan
- Locatie heeft geen specifieke bepalingen
- DSO data nog niet compleet (check DSO status)

### Voorschriften

**Q: Wat is het verschil tussen annotatie en voorschrift?**
A:
- **Annotatie** - Concrete waarde (bijv. "max bouwhoogte: 12m")
- **Voorschrift** - Regeltekst (bijv. "bebouwing moet passen in karakter")

**Q: Mag ik bouwen als er geen bouwhoogte staat?**
A: **Nee!** Ontbreken van data betekent niet "geen regels". Neem altijd contact op met de gemeente.

**Q: Zijn de getoonde regels juridisch bindend?**
A: De data komt van officiële bron, maar:
- Raadpleeg altijd de originele planteksten
- Bij twijfel: contact gemeente
- Deze app is een hulpmiddel, geen juridisch advies

### Kaart

**Q: Waarom zie ik geen plangebieden op de kaart?**
A: Mogelijke oorzaken:
- Geen GeoJSON data beschikbaar in DSO
- Plangebieden buiten het zichtbare gebied
- Zoom in voor betere weergave

**Q: Overlappende gebieden?**
A: Normaal! Meerdere plannen kunnen tegelijk van kracht zijn:
- Gemeentelijk omgevingsplan
- Provinciale verordening
- Rijks regels
Alle zijn van toepassing.

**Q: Kan ik andere kaartlagen toevoegen?**
A: Momenteel alleen OpenStreetMap. Voor uitbreiding: zie de technische documentatie.

### PDF Export

**Q: PDF is leeg of incompleet?**
A: Controleer:
- Browser JavaScript is enabled
- Pop-up blocker staat PDF download niet tegen
- Wacht tot alle data geladen is voor export

**Q: Kan ik de PDF layout aanpassen?**
A: Ja, zie `frontend/src/utils/pdfExport.js` voor customization.

**Q: Kan ik exporteren naar Word/Excel?**
A: Momenteel alleen PDF. Excel export staat op de roadmap.

### Technisch

**Q: Welke browsers worden ondersteund?**
A: Moderne browsers:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

**Q: Werkt de app op mobiel?**
A: Ja, de app is responsive. Voor beste ervaring: gebruik tablet of desktop.

**Q: Hoe lang duurt een zoekopdracht?**
A: Normaal 2-5 seconden, afhankelijk van:
- Internetsnelheid
- DSO API response tijd
- Complexiteit van plangebied

### Privacy & Security

**Q: Wordt mijn zoekgeschiedenis opgeslagen?**
A: Nee, alle zoekopdrachten zijn volledig anoniem en worden niet opgeslagen.

**Q: Worden mijn gegevens gedeeld?**
A: Nee. De app communiceert alleen met:
- PDOK (publieke dienst, geen tracking)
- DSO (officiële overheids-API)

**Q: Is mijn DSO API key veilig?**
A: Ja, als je de `.env` file niet deelt. De key wordt alleen server-side gebruikt.

---

## Hulp nodig?

### Documentatie
- **README.md** - Technische documentatie en installatie
- **IMPLEMENTATIE_GIDS.md** - Code uitleg en uitbreidingen

### Support
- GitHub Issues voor bugs en feature requests
- DSO Support: https://aandeslagmetdeomgevingswet.nl/
- PDOK Forum: https://www.pdok.nl/

### Community
- Deel je ervaringen en tips
- Contribueer verbeteringen via pull requests
- Help anderen in de community

---

**Veel succes met het raadplegen van omgevingsplannen! 🏗️🌱**
