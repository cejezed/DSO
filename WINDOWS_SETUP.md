# Quick Start Guide - Windows

## Er zijn installatie problemen? Volg deze stappen:

### Stap 1: Installeer alle dependencies

```powershell
# In de root directory (E:\DSO\dso)
npm install

# Installeer frontend dependencies
cd frontend
npm install
cd ..
```

### Stap 2: Stop eventueel draaiende processen op port 3000

**Optie A: Vind en stop het proces**
```powershell
# Vind welk proces port 3000 gebruikt
netstat -ano | findstr :3000

# Stop het proces (vervang <PID> met het Process ID)
taskkill /PID <PID> /F
```

**Optie B: Gebruik een andere port**
Bewerk je `.env` file en verander de port:
```
PORT=3001
```

### Stap 3: Start de applicatie

```powershell
npm run dev
```

## Alternatief: Start backend en frontend apart

**Terminal 1 (Backend):**
```powershell
npm run backend
```

**Terminal 2 (Frontend):**
```powershell
npm run frontend
```

## Als je nog steeds problemen hebt:

### Maak een .env file aan
```powershell
# Kopieer het voorbeeld
copy .env.example .env
```

### Gebruik deze quick-fix scripts:

**Windows (PowerShell):**
Maak een `start.ps1` bestand met:
```powershell
# Stop eventuele processen op port 3000
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Stop-Process -Id $port3000.OwningProcess -Force
}

# Start backend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run backend"

# Wacht 2 seconden
Start-Sleep -Seconds 2

# Start frontend
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; npm run frontend"
```

Run met: `.\start.ps1`
