# AuditPro – SAP S/4HANA Inventory Audit System

**ABC Flexible Packaging Ltd. | Internal Audit Division**
**Version 2.0 | React + Capacitor | Android APK + Desktop PWA**

---

## WHAT THIS IS

AuditPro is a complete inventory audit application that runs as:
- **Android APK** (installable on any Android phone/tablet)
- **Desktop PWA** (runs in any browser on laptop/PC)
- **USB Scanner compatible** (keyboard-wedge scanners auto-detected)

Features match your full audit specification:
- ✅ Login with pre-assigned auditor deployment
- ✅ Scan mode (camera + USB/Bluetooth scanner)
- ✅ Duplicate scan prevention (same batch never counted twice)
- ✅ Manual count mode with material search
- ✅ Location mismatch auto-detection
- ✅ Audit lock (cannot sign out until deployment complete)
- ✅ Auto-reconciliation at count close
- ✅ Desktop bulk entry mode
- ✅ Full SAP population (all 35 items, all 16 departments)

---

## HOW TO BUILD THE ANDROID APK (GitHub Actions)

### Step 1: Fork / Create GitHub Repository

```bash
# Clone this folder to your machine
git init
git add .
git commit -m "Initial AuditPro commit"
git remote add origin https://github.com/YOUR_USERNAME/auditpro.git
git push -u origin main
```

### Step 2: GitHub Actions builds it automatically

Every push to `main` triggers `.github/workflows/build-apk.yml` which:
1. Installs Node.js 20
2. Installs Java 17 + Android SDK
3. Runs `npm run build` (React production build)
4. Runs `npx cap sync android` (Capacitor sync)
5. Runs `./gradlew assembleDebug` (Android build)
6. Uploads `app-debug.apk` as a downloadable artifact

### Step 3: Download the APK

1. Go to your GitHub repository
2. Click **Actions** tab
3. Click the latest workflow run
4. Scroll to **Artifacts** section
5. Download **AuditPro-Debug-APK**
6. Transfer to Android device and install

> **Note:** Enable "Install from unknown sources" on Android device before installing.

---

## LOCAL DEVELOPMENT SETUP

### Prerequisites
- Node.js 20+
- Android Studio (for Android build)
- Java 17

### Install dependencies
```bash
npm install
```

### Run in browser (desktop mode)
```bash
npm start
# Opens at http://localhost:3000
```

### Build for Android
```bash
# First time only
npx cap init AuditPro com.abcflexpack.auditpro
npx cap add android

# Every build
npm run build:android
# Then open Android Studio
npx cap open android
# In Android Studio: Build > Build Bundle(s)/APK(s) > Build APK(s)
```

---

## DEMO LOGIN CREDENTIALS

| Username | Password | Assigned To |
|---|---|---|
| ahmed.khan | audit123 | Film Store Unit 1 |
| sara.malik | audit123 | Film Store Unit 1 + Lamination U1 |
| tariq.mehmood | audit123 | Film Store Unit 2 + Lamination U2 |
| nadia.iqbal | audit123 | Compounding Unit 2 + Waste Unit 2 |
| bilal.raza | audit123 | Flexo Unit 1 + Inks Unit 1 |
| hina.baig | audit123 | Extrusion Unit 2 + Slitting U2 |
| lead.auditor | lead123 | Lead (all departments) |
| it.admin | it123 | IT Administrator |

---

## FILE STRUCTURE

```
auditpro-app/
├── .github/
│   └── workflows/
│       └── build-apk.yml          ← GitHub Actions CI/CD pipeline
├── src/
│   ├── App.js                     ← Main React app (all screens)
│   ├── components/
│   │   ├── ScanScreen.js          ← Barcode scan + USB scanner
│   │   ├── ManualCountScreen.js   ← Search + manual qty entry
│   │   ├── ReportScreen.js        ← Auto-reconciliation output
│   │   ├── PopulationScreen.js    ← Full SAP population list
│   │   ├── DesktopAddScreen.js    ← Desktop bulk entry grid
│   │   └── LoginScreen.js         ← Auth with deployment mapping
│   ├── data/
│   │   ├── population.js          ← SAP_POPULATION (35 items, 16 depts)
│   │   └── users.js               ← USERS with deployment assignments
│   ├── hooks/
│   │   ├── useAuditStore.js       ← Local storage persistence
│   │   └── useUSBScanner.js       ← Keyboard-wedge USB scanner hook
│   └── utils/
│       └── reconcile.js           ← Reconciliation engine
├── public/
│   ├── manifest.json              ← PWA manifest
│   └── index.html
├── android-config/
│   └── AndroidManifest.xml        ← Camera + USB permissions
├── capacitor.config.ts            ← Capacitor config
├── package.json
└── README.md
```

---

## ARCHITECTURE

### Scan Flow
```
Auditor opens app → Selects dept → 
  SCAN MODE: Tap camera / USB scanner triggers → batch lookup in SAP_POPULATION →
    Duplicate check → if dup: toast + skip (never double count) →
    if loc mismatch: flag → if not in SAP: flag →
    Entry saved to localStorage (survives app close)

  MANUAL MODE: Type material name/code → System shows all SAP locations →
    Auditor enters physical qty per location separately →
    Variance auto-calculated per location
```

### Reconciliation Engine (runs at report time)
```javascript
reconcile(population, auditEntries) → results[]
// Checks per item:
// 1. Not counted → status: not_counted
// 2. Duplicate → excluded (isDuplicate flag)
// 3. Location match? → exception: Location Mismatch
// 4. qty === 0 → exception: Missing from Floor
// 5. qty !== sapQty → exception: Quantity Variance
// 6. Not in SAP → exception: Not in SAP
```

### Lock-out Logic
```javascript
// In logout():
const remaining = myItems.filter(item => !counted.includes(item.key))
if (remaining.length > 0) → BLOCK SIGNOUT + show count
// Auditor cannot exit until all their deployed items are counted
```

### USB Scanner Support
```javascript
// USB barcode scanners work as keyboard-wedge devices
// They type the barcode + Enter key very fast (<100ms per char)
// Hook detects high-speed keystrokes and routes to scan processor
useEffect(() => {
  // keydown listener with timing detection
  // if chars arrive < 100ms apart → it's a scanner, not keyboard
  // when Enter received → fire usb-scan event
}, [screen]);
```

---

## SAP INTEGRATION (Production)

Replace `src/data/population.js` static data with SAP OData API calls:

```javascript
// SAP OData URL example (S/4HANA Cloud or On-Premise)
const SAP_API = 'https://your-sap-host/sap/opu/odata/sap/MM_MATDOC_OBJ_SRV';

async function fetchPopulation(plant, period) {
  const url = `${SAP_API}/MaterialDocumentSet?$filter=Plant eq '${plant}' and PostingDate gt '${period}'`;
  const res = await fetch(url, { headers: { Authorization: 'Basic ' + btoa('user:pass') }});
  const data = await res.json();
  return mapSAPResponse(data.d.results);
}
```

Or use SAP BTP Connectivity Service for secure on-premise tunnel.

---

## PRODUCTION CHECKLIST

- [ ] Replace static USERS with SAP HR API or LDAP auth
- [ ] Replace static SAP_POPULATION with live SAP OData (MB52/MCHB)
- [ ] Set up SAP BTP or APIM gateway for secure API calls
- [ ] Sign APK with release keystore (not debug key)
- [ ] Configure HTTPS for production deployment
- [ ] Enable SAP Single Sign-On (SSO) if required
- [ ] Set up centralized audit log server (REST API)
- [ ] Test on Zebra TC-series scanners (common in warehouses)
- [ ] Test on Honeywell CT-series scanners
- [ ] Run load test with 35+ concurrent auditor sessions

---

## SUPPORT

Internal Audit Division | ABC Flexible Packaging Ltd.
Contact: IT Department for APK distribution and SAP API setup
