// frontend/ristorante/gestione-menu.js

let catalogoBase = []; 


// MOTORE NOTIFICHE CORAZZATO

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

document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('fastfood_token');
    const role = localStorage.getItem('fastfood_role');
    if (!token || role !== 'Ristoratore') {
        window.location.href = 'index.html';
        return;
    }

    caricaCatalogoBase();
    caricaIlMioMenu(); // Carica i piatti attualmente nel database

    document.getElementById('search-common').addEventListener('input', filtraCatalogo);
    document.getElementById('form-custom-dish').addEventListener('submit', aggiungiPiattoCustom);
});


// 1. CARICAMENTO DEL PROPRIO MENU

async function caricaIlMioMenu() {
    const token = localStorage.getItem('fastfood_token');
    const container = document.getElementById('my-menu-list');

    try {
        const response = await fetch('http://localhost:3000/api/restaurants/my-menu', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) throw new Error('Errore nel caricamento del menu');

        const menu = await response.json();
        
        container.innerHTML = '';
        if (menu.length === 0) {
            container.innerHTML = '<p style="color: var(--text-muted); text-align:center; width:100%;">Nessun piatto nel tuo menu. Aggiungine uno!</p>';
            return;
        }

        menu.forEach(piatto => {
            container.innerHTML += `
                <div class="my-dish-item">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <img src="${piatto.fotoUrl}" alt="${piatto.nome}" style="width: 50px; height: 50px; border-radius: 5px; object-fit: cover;">
                        <div class="dish-info">
                            <h4>${piatto.nome}</h4>
                            <p>€ ${piatto.prezzo.toFixed(2)} - ${piatto.tipologia}</p>
                        </div>
                    </div>
                    <button class="btn-delete" onclick="eliminaPiatto('${piatto._id}')">🗑️ Elimina</button>
                </div>
            `;
        });
    } catch (error) {
        container.innerHTML = '<p style="color: #e74c3c;">Errore nel caricamento.</p>';
    }
}


// 2. ELIMINAZIONE PIATTO

async function eliminaPiatto(dishId) {
    if (!confirm("Sei sicuro di voler rimuovere questo piatto dal tuo menu?")) return;

    const token = localStorage.getItem('fastfood_token');
    try {
        const response = await fetch(`http://localhost:3000/api/restaurants/menu/${dishId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
            showToast("Piatto eliminato con successo!", "success");
            caricaIlMioMenu(); // Ricarica la lista senza ricaricare la pagina
        } else {
            showToast("Errore durante l'eliminazione", "error");
        }
    } catch (error) {
        showToast("Errore di connessione col server.", "error");
    }
}


// 3. LOGICA CATALOGO BASE (JSON E RICERCA CORRETTA)

async function caricaCatalogoBase() {
    const listContainer = document.getElementById('common-dishes-list');
    try {
        const response = await fetch('http://localhost:3000/api/restaurants/meals');
        if (!response.ok) throw new Error('Errore nel caricamento');
        catalogoBase = await response.json();
        mostraPiattiCatalogo(catalogoBase);
    } catch (error) {
        listContainer.innerHTML = '<p style="color: #e74c3c; text-align: center;">Errore nel caricamento del catalogo.</p>';
    }
}

function mostraPiattiCatalogo(piatti) {
    const listContainer = document.getElementById('common-dishes-list');
    listContainer.innerHTML = ''; 

    piatti.forEach((piatto) => {
        const nomePiatto = piatto.strMeal || 'Piatto Sconosciuto';
        const categoria = piatto.strCategory || 'Varie';

        // Creiamo una stringa sicura (sostituisce eventuali apici nel nome per non rompere l'HTML)
        const nomeSicuro = nomePiatto.replace(/'/g, "\\'");

        listContainer.innerHTML += `
            <div class="common-dish-item">
                <div class="dish-info">
                    <h4>${nomePiatto}</h4>
                    <p>Tipologia: ${categoria}</p>
                </div>
                <button class="btn-add-common" onclick="aggiungiDalCatalogo('${nomeSicuro}')">➕ Aggiungi</button>
            </div>
        `;
    });
}

function filtraCatalogo(e) {
    const testoCercato = e.target.value.toLowerCase();
    const piattiFiltrati = catalogoBase.filter(p => 
        (p.strMeal || '').toLowerCase().includes(testoCercato)
    );
    mostraPiattiCatalogo(piattiFiltrati);
}

async function aggiungiDalCatalogo(nomePiattoCercato) {
    // Troviamo il piatto nel catalogo base cercando il nome esatto
    const piattoScelto = catalogoBase.find(p => p.strMeal === nomePiattoCercato);
    
    if (!piattoScelto) {
        showToast("Errore: piatto non trovato nel catalogo.", "error");
        return;
    }

    const listaIngredienti = (piattoScelto.ingredients && Array.isArray(piattoScelto.ingredients)) 
        ? piattoScelto.ingredients.join(', ') 
        : 'Ingredienti segreti';
    
    const datiPiatto = {
        nome: piattoScelto.strMeal,
        tipologia: piattoScelto.strCategory,
        prezzo: 5.00, 
        ingredienti: listaIngredienti,
        fotoUrl: piattoScelto.strMealThumb || 'https://via.placeholder.com/300?text=Foto+Piatto'
    };
    
    inviaPiattoAlServer(datiPiatto);
}


// 4. PIATTO CUSTOM E INVIO AL SERVER

async function aggiungiPiattoCustom(e) {
    e.preventDefault();
    const datiPiatto = {
        nome: document.getElementById('dish-nome').value,
        tipologia: document.getElementById('dish-tipologia').value,
        prezzo: parseFloat(document.getElementById('dish-prezzo').value),
        ingredienti: document.getElementById('dish-ingredienti').value,
        fotoUrl: document.getElementById('dish-foto').value || 'https://via.placeholder.com/300?text=Foto+Piatto'
    };
    inviaPiattoAlServer(datiPiatto);
}

async function inviaPiattoAlServer(datiPiatto) {
    const token = localStorage.getItem('fastfood_token');
    try {
        const response = await fetch('http://localhost:3000/api/restaurants/menu/custom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(datiPiatto)
        });

        if (response.ok) {
            showToast("Piatto aggiunto al tuo menu con successo!", "success");
            document.getElementById('form-custom-dish').reset();
            caricaIlMioMenu(); // Aggiorna istantaneamente la lista in basso
        } else {
            showToast("Errore durante l'aggiunta del piatto.", "error");
        }
    } catch (error) {
        showToast("Nessuna risposta dal server.", "error");
    }
}