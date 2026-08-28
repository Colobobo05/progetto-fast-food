// frontend/profilo.js

document.addEventListener('DOMContentLoaded', () => {
    caricaDatiProfilo();

    // Gestione del tasto Salva 
    document.getElementById('profile-form').addEventListener('submit', (e) => {
        e.preventDefault();
        aggiornaProfilo();
    });

    // Gestione del tasto Elimina
    document.getElementById('btn-delete-account').addEventListener('click', () => {
        eliminaAccount();
    });
});

async function caricaDatiProfilo() {
    const token = localStorage.getItem('fastfood_token');
    if (!token) {
        window.location.href = 'accedi.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/users/profile', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            const utente = await response.json();
            
            // Riempiamo i campi del form
            document.getElementById('prof-ruolo').value = utente.role;
            document.getElementById('prof-nome').value = utente.nome || '';
            document.getElementById('prof-cognome').value = utente.cognome || '';
            document.getElementById('prof-email').value = utente.email;
            
            if (utente.role === 'Cliente') {
                document.getElementById('prof-pagamento').value = utente.metodoPagamento || '';
            } else {
                // Se è un ristoratore, nascondiamo il metodo di pagamento del cliente
                document.getElementById('group-pagamento').style.display = 'none';
            }
        } else {
            showToast("Errore nel caricamento del profilo. Effettua di nuovo il login.", "error");
            localStorage.removeItem('fastfood_token');
            
            setTimeout(() => {
                window.location.href = 'accedi.html';
            }, 1500);
        }
    } catch (error) {
        console.error("Errore:", error);
    }
}

async function aggiornaProfilo() {
    const token = localStorage.getItem('fastfood_token');
    
    // 1. Raccogliamo SOLO i dati di base che vanno bene per tutti
    const datiAggiornati = {
        nome: document.getElementById('prof-nome').value,
        cognome: document.getElementById('prof-cognome').value
    };

    // 2. Raccogliamo il pagamento, ma lo inviamo SOLO se non è vuoto
    const metodoScelto = document.getElementById('prof-pagamento').value;
    if (metodoScelto !== "") {
        datiAggiornati.metodoPagamento = metodoScelto;
    }

    try {
        const response = await fetch('http://localhost:3000/api/users/profile', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(datiAggiornati) // Adesso inviamo i dati puliti
        });

        if (response.ok) {
            showToast("Dati aggiornati con successo!", "success");
        } else {
            showToast("Errore durante l'aggiornamento.", "error");
        }
    } catch (error) {
        console.error("Errore:", error);
        showToast("Errore di connessione al server.", "error");
    }
}

async function eliminaAccount() {
    const conferma = confirm("Sei SICURO di voler eliminare il tuo account? Questa azione non può essere annullata.");
    
    if (!conferma) return; // Se l'utente clicca 'Annulla', ci fermiamo qui

    const token = localStorage.getItem('fastfood_token');
    
    try {
        const response = await fetch('http://localhost:3000/api/users/profile', {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showToast("Account eliminato. Ci dispiace vederti andare via! ", "info");
            localStorage.removeItem('fastfood_token');
            localStorage.removeItem('fastfood_clienteId');
            
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showToast("Errore durante l'eliminazione dell'account.", "error");
        }
    } catch (error) {
        console.error("Errore:", error);
        showToast("Errore di connessione al server.", "error");
    }
}