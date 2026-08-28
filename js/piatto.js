// frontend/ristorante/piatto.js


//          MOTORE NOTIFICHE CORAZZATO

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

let piattoCorrente = null;
let quantita = 1;

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const piattoId = urlParams.get('piattoId');

    if (piattoId) {
        fetchDishDetails(piattoId);
    } else {
        document.getElementById('dish-detail-container').innerHTML = 
            '<p style="color:red; text-align:center; font-size: 1.5rem;">Nessun piatto selezionato. Torna alla Home!</p>';
    }
});

async function fetchDishDetails(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/dishes/${id}`);
        if (!response.ok) throw new Error('Piatto non trovato');

        const piatto = await response.json();
        piattoCorrente = piatto; 
        renderDish(piatto);
    } catch (error) {
        console.error(error);
        document.getElementById('dish-detail-container').innerHTML = 
            '<p style="color:red; text-align:center;">Errore di connessione o piatto inesistente.</p>';
    }
}

function renderDish(piatto) {
    const container = document.getElementById('dish-detail-container');
    
    const ingredientiTesto = (piatto.ingredienti && piatto.ingredienti.length > 0) 
        ? piatto.ingredienti.join(', ') 
        : 'Ingredienti segreti dello chef!';

    container.innerHTML = `
        <div class="dish-layout">
            <div class="dish-image-large">
                <img src="${piatto.fotoUrl || 'https://via.placeholder.com/600x400?text=Foto+Non+Disponibile'}" alt="${piatto.nome}">
            </div>
            <div class="dish-info-box">
                <h2 class="dish-restaurant-name">Categoria: ${piatto.tipologia}</h2>
                <h1>${piatto.nome}</h1>
                <p class="dish-desc">
                    <strong>Ingredienti:</strong> ${ingredientiTesto}
                </p>
                <div class="dish-price-large">€ ${parseFloat(piatto.prezzo).toFixed(2)}</div>

                <div class="add-to-cart-box">
                    <div class="quantity-selector">
                        <button class="quantity-btn" onclick="cambiaQuantita(-1)">-</button>
                        <span class="quantity-number" id="quantita-display">1</span>
                        <button class="quantity-btn" onclick="cambiaQuantita(1)">+</button>
                    </div>
                    <button class="btn-add-cart" onclick="aggiungiAlCarrello()">Aggiungi al Carrello</button>
                </div>
            </div>
        </div>
    `;
}

function cambiaQuantita(delta) {
    quantita += delta;
    if (quantita < 1) quantita = 1; 
    document.getElementById('quantita-display').innerText = quantita;
}

function aggiungiAlCarrello() {
    if (!piattoCorrente) return;

    let carrello = JSON.parse(localStorage.getItem('fastfood_cart')) || [];
    const index = carrello.findIndex(item => item._id === piattoCorrente._id);
    
    if (index > -1) {
        carrello[index].quantita += quantita;
    } else {
        carrello.push({ ...piattoCorrente, quantita: quantita });
    }

    localStorage.setItem('fastfood_cart', JSON.stringify(carrello));
    
    showToast(`Ottimo! Hai aggiunto ${quantita}x ${piattoCorrente.nome} al carrello `, "success");
}