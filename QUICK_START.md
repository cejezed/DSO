# 🚀 Quick Start - Kom Direct aan de Slag!

## ⚠️ Heb je installatie problemen? Lees dit eerst!

### Probleem: Port 3000 is al in gebruik

**Snelle oplossing:**
```powershell
# Run dit script om port 3000 vrij te maken
.\kill-port-3000.bat
```

**Of gebruik een andere port:**
1. Open `.env` file
2. Verander `PORT=3000` naar `PORT=3001`
3. Probeer opnieuw

---

### Probleem: 'vite' is not recognized

Dit betekent dat frontend dependencies niet geïnstalleerd zijn.

**Oplossing:**
```powershell
.\setup.bat
```

Of handmatig:
```powershell
npm install
cd frontend
npm install
cd ..
```

---

## ✅ Eerste keer installatie (3 minuten)

### Optie 1: Geautomatiseerd (Aanbevolen voor Windows)

```powershell
# Stap 1: Run setup script
.\setup.bat

# Stap 2: Start de app
.\start.bat
```

### Optie 2: Handmatig (Werkt op alle systemen)

```bash
# Stap 1: Installeer dependencies
npm install
cd frontend
npm install
cd ..

# Stap 2: Maak .env file
copy .env.example .env    # Windows
# OF
cp .env.example .env      # Mac/Linux

# Stap 3: Start de app
npm run dev
```

---

## 🎯 De applicatie gebruiken

### Starten

**Windows:**
```powershell
.\start.bat
```

**Mac/Linux of handmatig:**
```bash
npm run dev
```

### Openen in browser

Na het starten:
1. **Frontend**: Open http://localhost:5173
2. **Backend API**: http://localhost:3000/api/health

### Eerste zoekopdracht

1. Typ in de zoekbalk: **"Plein 1945 1, Haarlem"**
2. Druk op Enter of klik "Zoek"
3. Bekijk de resultaten!

---

## 🔧 Troubleshooting

### ❌ Fout: "EADDRINUSE: address already in use :::3000"

**Betekenis:** Er draait al iets op port 3000

**Oplossing 1 (Snelst):**
```powershell
.\kill-port-3000.bat
npm run dev
```

**Oplossing 2 (Veiliger):**
1. Open `.env` file
2. Verander `PORT=3000` naar `PORT=3001`
3. Start opnieuw: `npm run dev`

**Oplossing 3 (Handmatig):**
```powershell
# Vind het proces
netstat -ano | findstr :3000

# Stop het proces (vervang <PID> met het Process ID)
taskkill /PID <PID> /F
```

---

### ❌ Fout: "'vite' is not recognized"

**Betekenis:** Frontend dependencies zijn niet geïnstalleerd

**Oplossing:**
```powershell
cd frontend
npm install
cd ..
npm run dev
```

---

### ❌ Fout: "Cannot find module 'express'"

**Betekenis:** Backend dependencies zijn niet geïnstalleerd

**Oplossing:**
```powershell
npm install
npm run dev
```

---

### ❌ Fout: "DSO API error: 401"

**Betekenis:** DSO API key is niet correct of ontbreekt

**Oplossing:**

Dit is **GEEN kritieke fout** voor testen! De app werkt gedeeltelijk zonder API key.

Voor volledige functionaliteit:
1. Vraag een DSO API key aan op https://aandeslagmetdeomgevingswet.nl/
2. Open `.env` file
3. Voeg je key toe: `DSO_API_KEY=jouw_key_hier`
4. Herstart de app

---

### ❌ Frontend laadt niet (witte pagina)

**Check:**
1. Is de frontend server gestart? Zie je "Local: http://localhost:5173" in de terminal?
2. Zijn er errors in de browser console? (F12 → Console tab)
3. Run: `cd frontend && npm install && cd ..`

---

### ❌ Backend reageert niet

**Check:**
1. Is de backend server gestart? Zie je "Backend server draait op..." in de terminal?
2. Test: Open http://localhost:3000/api/health in je browser
3. Check de terminal voor error messages

---

## 📁 Bestandsstructuur

```
E:\DSO\dso\
├── setup.bat              ← Run dit eerst!
├── start.bat              ← Run dit om te starten
├── kill-port-3000.bat     ← Port 3000 bevrijden
├── .env                   ← Jouw configuratie (maak aan)
├── .env.example           ← Template voor .env
├── backend/               ← Server code
├── frontend/              ← Website code
└── README.md              ← Volledige documentatie
```

---

## 💡 Handige Commands

### Development

```powershell
# Start alles (backend + frontend)
npm run dev

# Start alleen backend
npm run backend

# Start alleen frontend
npm run frontend

# Installeer alles opnieuw
npm run install-all
```

### Productie

```powershell
# Build frontend voor productie
npm run build

# Start backend in productie mode
npm start
```

### Opruimen

```powershell
# Verwijder dependencies (als je opnieuw wilt installeren)
rmdir /s /q node_modules
rmdir /s /q frontend\node_modules

# Installeer opnieuw
npm run install-all
```

---

## 🎓 Wat nu?

### Voor gebruikers:
- **GEBRUIKERSHANDLEIDING.md** - Uitgebreide gebruikersgids

### Voor developers:
- **README.md** - Technische documentatie
- **IMPLEMENTATIE_GIDS.md** - Code deep dive

### Voor support:
- **GitHub Issues** - Bug reports en feature requests

---

## ⚡ TL;DR - Supersonel starten

```powershell
# 1. Installeer
.\setup.bat

# 2. (Optioneel) Als port 3000 bezet is
.\kill-port-3000.bat

# 3. Start
.\start.bat

# 4. Open browser
# → http://localhost:5173

# 5. Zoek adres
# → "Plein 1945 1, Haarlem"
```

**Klaar! 🎉**

---

## 📞 Hulp nodig?

1. **Check deze QUICK_START.md** - meeste problemen staan hierboven
2. **Check TROUBLESHOOTING sectie** in README.md
3. **Windows specifieke problemen?** - Zie WINDOWS_SETUP.md
4. **GitHub Issues** - Voor bugs en vragen

---

**Succes! Je gaat het geweldig doen! 🚀**
