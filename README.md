
# 🏥 CNAMji – Assistant Santé Intelligent

**CNAMji** est une plateforme web interactive qui aide les citoyens tunisiens à comprendre leurs droits en matière de santé publique, simuler leurs remboursements CNAM, dialoguer avec un chatbot vocal intelligent, et extraire automatiquement les informations de documents médicaux.

---

## 🚀 Fonctionnalités principales

### 🤖 Chatbot vocal intelligent (Français / Arabe)
- Comprend vos questions en texte ou via la voix (Web Speech API).
- Répond sur les thèmes suivants :
  - Tarifs CNAM
  - Calcul des cotisations (article 15 de la loi 2004-71)
  - Droits des assurés et ayants droit
  - Démarches et recours administratifs
- Paramétrage vocal (voix, vitesse, tonalité, volume).
- Voix responsive et multilingue.

### 📁 Upload et extraction de documents médicaux
- Permet au patient de :
  - Glisser-déposer un fichier PDF, JPG, PNG ou DOCX.
  - Extraire automatiquement des informations clés :
    - Nom du patient
    - Date de naissance
    - Diagnostic
    - Médecin traitant
    - Traitement
    - Date du document
  - Télécharger un rapport structuré.
- Utile pour éviter les erreurs de saisie manuelle lors de démarches CNAM.

### 🏥 Services santé
- Liste des hôpitaux publics
- Numéros d’urgence médicale
- Guide simplifié des procédures CNAM

---

## 🧱 Architecture du projet

```
ProjetAins/
├── BackendFlask/             ← Backend API en Python (Flask)
│   ├── app.py                ← Point d’entrée Flask
│   ├── routes/               ← Routes de l’API
│   │   └── chatbot.py
│   ├── utils/                ← Extraction document, calcul, etc.
│   │   └── ocr_parser.py
│   ├── models/               ← (optionnel) fichiers d’IA ou traitement
│   └── requirements.txt
│
├── FrontendReact/           ← Frontend en React + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── VoiceChat.tsx      ← Composant du chatbot vocal
│   │   │   ├── ChatInterface.tsx  ← Interface classique avec bulle
│   │   │   └── Header.tsx
│   │   ├── pages/Index.tsx       ← Page principale
│   │   └── App.tsx               ← Routes principales
│   ├── public/
│   │   └── voicechat-script.js   ← Script JS impératif (Web Speech API)
│   └── package.json
```

---

## 🛠️ Technologies utilisées

### Frontend
- **React + TypeScript**
- Vite (pour le build rapide)
- ShadCN / TailwindCSS pour l’UI
- Web Speech API (reconnaissance et synthèse vocale)
- Radix UI / Lucide icons

### Backend
- **Flask**
- Tesseract OCR (extraction texte)
- spaCy ou regex pour l’analyse sémantique
- Flask-CORS / Flask-RESTful

---

## ⚙️ Lancer le projet localement

### 1. Backend Flask (API)
```bash
cd BackendFlask
python -m venv venv
source venv/bin/activate      # sur Windows : venv\Scripts\activate
pip install -r requirements.txt
python app.py                 # démarre sur http://localhost:5000
```

### 2. Frontend React
```bash
cd FrontendReact
npm install
npm run dev                   # démarre sur http://localhost:8080
```

> ⚠️ Assurez-vous que `voicechat-script.js` est bien dans `public/` côté React.

---

## 🌐 Accès

- Page d’accueil : `http://localhost:8080`
- Chatbot vocal : `http://localhost:8080/cnam`

---

## 📦 Dépendances principales

### Frontend
- `react`, `vite`, `shadcn/ui`, `lucide-react`
- `@tanstack/react-query`, `react-router-dom`

### Backend
- `flask`, `flask-cors`
- `pytesseract`, `Pillow`, `spacy`

---


