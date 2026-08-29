# progetto-fast-food
<div align="center">
  <img src="./frontend/loghi/logo.png" alt="Logo Fast Food" width="600">
  <h1>Fast Food API & Web Client</h1>
</div>

**Progetto accademico per un sistema di gestione ordini basato su architettura Client-Server, API RESTful e pattern MVC.**

Questo repository contiene l'intero ecosistema dell'applicazione. L'obiettivo del progetto è dimostrare la corretta implementazione delle moderne pratiche di sviluppo web, dalla persistenza dei dati fino alla sicurezza degli endpoint.

📦 fast-food-project
┣ 📂 backend
┃ ┣ 📂 config          # Connessione a MongoDB e configurazioni globali
┃ ┣ 📂 controllers     # Logica operativa (es. authController.js)
┃ ┣ 📂 middleware      # Filtri di sicurezza (es. verifyToken, checkRole)
┃ ┣ 📂 models          # Schemi Mongoose (User.js, Menu.js, Order.js)
┃ ┣ 📂 routes          # Indirizzamento API (es. authRoutes.js)
┃ ┣ 📜 .env            # Variabili d'ambiente segrete (NON caricato su GitHub)
┃ ┣ 📜 server.js       # Cuore del backend, avvio Express e Swagger
┃ ┗ 📜 package.json    # Dipendenze e script di avvio (npm start)
┗ 📂 frontend
  ┣ 📂 css             # Fogli di stile centralizzati
  ┃ ┗ 📜 style.css     # Regole grafiche e Media Queries (Mobile-First)
  ┣ 📂 images          # Asset visivi (es. logo.png)
  ┣ 📂 js              # Logica client-side modulare
  ┃ ┣ 📜 app.js        # Script globale (Gestione navbar e Logout)
  ┃ ┗ 📜 accedi.js     # Fetch API per il Login e gestione Local Storage
  ┣ 📜 index.html      # Homepage
  ┣ 📜 accedi.html     # Pagina di autenticazione
  ┗ 📜 menu.html       # Pagina ricerca piatti

## 🏗 Architettura e Tecnologie

| Livello | Tecnologie | Ruolo Architetturale |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, Vanilla JS | Rendering UI responsivo (Mobile-First) e gestione dello stato client-side. |
| **Backend** | Node.js, Express.js | Logica di business, routing degli endpoint e controller basati su Promise (async/await). |
| **Database** | MongoDB, Mongoose | Persistenza dati NoSQL con validazione tramite Schemi strutturati. |
| **Sicurezza** | JWT, Bcrypt | Crittografia password e gestione degli accessi tramite sessioni stateless. |
| **Testing** | Swagger (OpenAPI) | Documentazione interattiva degli endpoint RESTful. |

## 🚀 Istruzioni per la Valutazione (Setup Locale)

1. **Clonare il repository** in locale e aprire due terminali separati.
2. **Configurazione Backend:**
   * Entrare nella root del backend ed eseguire `npm install`.
   * Creare un file `.env` contenente:
     ```env
     PORT=3000
     MONGO_URI=inserire_stringa_connessione_qui
     JWT_SECRET=chiave_segreta_per_firma_token
     ```
   * Avviare il server con `npm start`.
3. **Configurazione Frontend:**
   * Aprire la cartella frontend tramite Visual Studio Code.
   * Lanciare il file `index.html` **esclusivamente tramite l'estensione Live Server** (porta 5500) per evitare blocchi CORS.
