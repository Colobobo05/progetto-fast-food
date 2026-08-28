// frontend/ristorante/ristorante.js


//         MOTORE NOTIFICHE CORAZZATO

function showToast(message, type = 'info') {
    if (!document.getElementById('toast-styles')) {
        const style = document.createElement('style');
        style.id = 'toast-styles';
        style.innerHTML = `
            #toast-container { position: fixed; bottom: 20px; right: 20px; z-index: 9999; display: flex; flex-direction: column; gap: 10px; }
            .toast { background: #1a1a1a; color: white; padding: 15px 20px; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 12px; min-width: 280px; max-width: 350px; border-left: 5px solid #333; opacity: 0; transform: translateX(100%); transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55); font-weight: 500; font-family: sans-serif; }
            .toast.show { opacity: 1; transform: translateX(0); }
            .toast-success { border-left-color: #2ecc71; }
            .toast-error { border-left-color: #e74c3c; }
            .toast-icon { font-size: 1.2rem; }
        `;
        document.head.appendChild(style);
    }
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    let icon = type === 'success' ? '✅' : type === 'error' ? '⚠️' : '🔔';
    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); 
    }, 3500);
}


//      LOGICA DELLA PAGINA RISTORANTE


document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('fastfood_token');
    if (!token) {
        window.location.href = '../accedi.html'; // Percorso corretto per tornare indietro
        return;
    }

    controllaStatoRistorante();

    document.getElementById('form-crea-ristorante').addEventListener('submit', creaNuovoRistorante);
});

async function controllaStatoRistorante() {
    const token = localStorage.getItem('fastfood_token');
    const userId = localStorage.getItem('fastfood_clienteId');

    try {
        // Usa la rotta corretta del tuo backend
        const response = await fetch('http://localhost:3000/api/restaurants', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Errore nel caricamento dei dati');

        const ristoranti = await response.json();
        
        // Cerca se esiste un ristorante associato a questo utente
        // Nota: in base al tuo controller, il campo è "userId"
        const mioRistorante = ristoranti.find(r => r.userId === userId);

        document.getElementById('loading-msg').style.display = 'none';

        if (mioRistorante) {
            // RISTORANTE ESISTE
            document.getElementById('crea-ristorante-container').style.display = 'none';
            document.getElementById('ristorante-attivo-container').style.display = 'block';

            document.getElementById('display-nome-risto').innerText = mioRistorante.nome;
            document.getElementById('display-indirizzo-risto').innerText = mioRistorante.indirizzo;
            document.getElementById('display-piva-risto').innerText = mioRistorante.partitaIva || 'Non specificata';
            document.getElementById('display-img-risto').src = mioRistorante.immagine || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
        } else {
            // NESSUN RISTORANTE
            document.getElementById('crea-ristorante-container').style.display = 'block';
            document.getElementById('ristorante-attivo-container').style.display = 'none';
        }

    } catch (error) {
        console.error(error);
        showToast("Errore di connessione col server.", "error");
    }
}

async function creaNuovoRistorante(e) {
    e.preventDefault();

    const token = localStorage.getItem('fastfood_token');

    const btnSubmit = e.target.querySelector('button');
    const originalText = btnSubmit.innerText;
    btnSubmit.innerText = "Creazione in corso... ⏳";
    btnSubmit.disabled = true;

    // Crea l'oggetto ESATTAMENTE come lo aspetta il tuo restaurantController.js
    const nuovoRistorante = {
        nome: document.getElementById('risto-nome').value,
        indirizzo: document.getElementById('risto-indirizzo').value,
        partitaIva: document.getElementById('risto-piva').value,
        immagine: document.getElementById('risto-immagine').value, // Questo nel backend attuale non lo stai salvando, ma va bene lo stesso
        descrizione: document.getElementById('risto-descrizione').value,
        telefono: "0000000000", // Aggiunto un default perché nel controller c'è
        luogo: document.getElementById('risto-indirizzo').value // Aggiunto un default per il luogo
    };

    try {
        // Usiamo la rotta `/setup` che hai configurato
        const response = await fetch('http://localhost:3000/api/restaurants/setup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(nuovoRistorante)
        });

        const data = await response.json();

        if (response.ok) {
            showToast("🎉 Ristorante aperto con successo!", "success");
            
            setTimeout(() => {
                window.location.reload(); 
            }, 1500);
        } else {
            showToast(" Errore: " + (data.message || "Impossibile creare il ristorante"), "error");
            btnSubmit.innerText = originalText;
            btnSubmit.disabled = false;
        }
    } catch (error) {
        console.error(error);
        showToast("Nessuna risposta dal server.", "error");
        btnSubmit.innerText = originalText;
        btnSubmit.disabled = false;
    }
}