# progetto fast food
<div align="center">
  <img src="./frontend/loghi/logo.png" alt="Logo Fast Food" width="600">
  <h1>Fast Food API & Web Client</h1>
</div>

**Progetto accademico per un sistema di gestione ordini basato su architettura Client-Server, API RESTful e pattern MVC.**

Questo repository contiene l'intero ecosistema dell'applicazione. L'obiettivo del progetto è dimostrare la corretta implementazione delle moderne pratiche di sviluppo web, dalla persistenza dei dati fino alla sicurezza degli endpoint.

<pre>
📦 fast-food-project
┣ 📂 backend
┃ ┣ 📂 config          # Connessione a MongoDB e configurazioni globali
┃ ┣ 📂 controllers     # Logica operativa (authController, menuController, orderController)
┃ ┣ 📂 middleware      # Filtri di sicurezza (verifyToken, checkRole)
┃ ┣ 📂 models          # Schemi Mongoose (User.js, MenuItem.js, Order.js)
┃ ┣ 📂 routes          # Indirizzamento API (authRoutes, menuRoutes, orderRoutes)
┃ ┣ 📜 .env            # Variabili d'ambiente segrete (NON caricato su GitHub)
┃ ┣ 📜 server.js       # Cuore del backend, avvio Express e Swagger
┃ ┗ 📜 package.json    # Dipendenze e script di avvio (npm start)
┗ 📂 frontend
  ┣ 📂 css             # Fogli di stile centralizzati
  ┃ ┗ 📜 style.css     # Regole grafiche e Media Queries (Mobile-First)
  ┣ 📂 images          # Asset visivi (logo.png, banner, foto prodotti)
  ┣ 📂 js              # Logica client-side modulare
  ┃ ┣ 📜 app.js        # Script globale (Gestione navbar, sessione e Logout)
  ┃ ┣ 📜 accedi.js     # Fetch API Login e salvataggio Local Storage
  ┃ ┣ 📜 registrati.js # Fetch API Registrazione nuovo account
  ┃ ┣ 📜 menu.js       # Caricamento dinamico piatti e filtri di ricerca
  ┃ ┣ 📜 carrello.js   # Gestione quantità, totale e invio ordine
  ┃ ┗ 📜 ordini.js     # Visualizzazione storico ordini e stato avanzamento
  ┣ 📜 index.html      # Homepage di benvenuto
  ┣ 📜 accedi.html     # Pagina di autenticazione (Login)
  ┣ 📜 registrati.html # Pagina registrazione nuovo utente
  ┣ 📜 menu.html       # Catalogo prodotti e selezione categorie
  ┣ 📜 carrello.html   # Riepilogo carrello e checkout
  ┣ 📜 ordini.html     # Tracciamento e storico ordini cliente
  ┗ 📜 dashboard.html  # Pannello di gestione riservato al Ristoratore
</pre>
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
