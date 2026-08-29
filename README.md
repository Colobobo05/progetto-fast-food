# progetto-fast-food
<div align="center">
  <img src="./frontend/loghi/logo.png" alt="Logo Fast Food" width="200">
  <h1>Fast Food API & Web Client</h1>
</div>

**Progetto accademico per un sistema di gestione ordini basato su architettura Client-Server, API RESTful e pattern MVC.**

Questo repository contiene l'intero ecosistema dell'applicazione. L'obiettivo del progetto è dimostrare la corretta implementazione delle moderne pratiche di sviluppo web, dalla persistenza dei dati fino alla sicurezza degli endpoint.

## 📁 Struttura del Progetto (Pattern MVC)
Il codice backend è stato organizzato separando rigidamente le responsabilità:

* **`models/` (Data Layer):** Contiene gli schemi Mongoose. Definisce la struttura, i tipi di dato e le validazioni rigorose pre-salvataggio.
* **`controllers/` (Business Logic):** Il cuore operativo. Questi file ricevono le richieste, interrogano il database asincronamente e formulano le risposte JSON.
* **`routes/` (Routing):** Mappa gli endpoint URL (es. `/api/auth/login`) ai rispettivi metodi del controller, mantenendo il server pulito e modulare.
* **`middleware/` (Security Layer):** Funzioni di intercettazione che verificano la validità del token JWT e i permessi di ruolo prima di concedere l'accesso ai controller protetti.

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
