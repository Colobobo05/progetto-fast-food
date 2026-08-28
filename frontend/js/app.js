// frontend/app.js

document.addEventListener('DOMContentLoaded', () => {

    // 1. LOGICA NAVBAR DINAMICA, RUOLI E LOGOUT
    
    const token = localStorage.getItem('fastfood_token');
    const role = localStorage.getItem('fastfood_role'); // Prende il ruolo (Cliente/Ristoratore)
    const navAccedi = document.getElementById('nav-accedi');
    const navProfilo = document.getElementById('nav-profilo');
    
    // Controlla se l'utente ha il passaporto (Token)
    if (token && role) {
        if (navAccedi) navAccedi.style.display = 'none';
        if (navProfilo) navProfilo.style.display = 'inline-block';

        // FILTRO VOCI MENU PROFILO IN BASE AL RUOLO
        const vociRistoratore = document.querySelectorAll('.classe-ristoratore');
        const vociCliente = document.querySelectorAll('.classe-cliente');

        if (role === 'Ristoratore') {
            vociRistoratore.forEach(el => el.style.display = 'block');
            vociCliente.forEach(el => el.style.display = 'none');
        } else {
            vociRistoratore.forEach(el => el.style.display = 'none');
            vociCliente.forEach(el => el.style.display = 'block');
        }

    } else {
        if (navAccedi) navAccedi.style.display = 'inline-block';
        if (navProfilo) navProfilo.style.display = 'none';
    }

    // Funzione Log Out
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('fastfood_token');
            localStorage.removeItem('fastfood_clienteId');
            localStorage.removeItem('fastfood_role'); // Puliamo anche il ruolo!
            
            showToast('Hai effettuato il logout. A presto!', 'info');
            
            setTimeout(() => {
                window.location.href = 'index.html'; 
            }, 1000);
        });
    }

   
    // 2. LOGICA HOME PAGE (Bestseller e Ristoranti)
   
    const bestsellersContainer = document.getElementById('bestsellers-container');
    if (bestsellersContainer) {
        fetchBestsellers();
        fetchRestaurants();
    }

   
    // 3. LOGICA BARRA DI RICERCA
    
    const searchBtn = document.getElementById('search-btn');
    const searchInput = document.getElementById('search-input');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            avviaRicerca(searchInput.value);
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                avviaRicerca(searchInput.value);
            }
        });
    }
});

function avviaRicerca(testo) {
    const query = testo.trim();
    if (query !== '') {
        window.location.href = `menu.html?search=${encodeURIComponent(query)}`;
    }
}

async function fetchBestsellers() {
    try {
        const response = await fetch('http://localhost:3000/api/orders/bestsellers');
        const data = await response.json();
        
        const container = document.getElementById('bestsellers-container');
        if (!container) return; 
        
        container.innerHTML = ''; 

        data.forEach((item) => {
            const piatto = item.piattoInfo;
            const card = document.createElement('div');
            card.className = 'card';
            
            card.onclick = () => window.location.href = `piatto.html?piattoId=${piatto._id}`; 
            
            card.innerHTML = `
                <div class="card-image-wrapper">
                    <img src="${piatto.fotoUrl || 'https://via.placeholder.com/300x200?text=Foto+Non+Disponibile'}" alt="${piatto.nome}">
                </div>
                <div class="card-content">
                    <div class="card-title">${piatto.nome}</div>
                    <div class="card-category">${piatto.tipologia}</div>
                    <div class="card-footer">
                        <div class="card-price">€ ${parseFloat(piatto.prezzo).toFixed(2)}</div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (error) {
        console.error("Errore bestseller:", error);
    }
}


//       Card Orizzontali Ristoranti

async function fetchRestaurants() {
    try {
        const response = await fetch('http://localhost:3000/api/restaurants');
        const ristoranti = await response.json();
        
        const track = document.getElementById('restaurants-track');
        if (!track) return; 
        
        track.innerHTML = ''; 

        if (ristoranti.length === 0) {
            track.innerHTML = '<p style="color: var(--text-muted); text-align: center; width: 100%;">Nessun ristorante disponibile.</p>';
            return;
        }

        ristoranti.forEach((risto, index) => {
            // Seleziona l'immagine caricata dal ristoratore o usa la bellissima foto di fallback
            const bgImage = risto.immagine || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80';
            
            const card = document.createElement('div');
            
            card.style.position = 'relative';
            card.style.height = '300px';
            card.style.borderRadius = '15px';
            card.style.overflow = 'hidden';
            card.style.marginBottom = '30px';
            card.style.cursor = 'pointer';
            card.style.display = 'flex';
            card.style.alignItems = 'center';
            card.style.justifyContent = 'center';
            card.style.backgroundImage = `url('${bgImage}')`;
            card.style.backgroundSize = 'cover';
            card.style.backgroundPosition = 'center';
            card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.5)';
            card.style.transition = '0.3s ease';
            
            // Effetto hover
            card.onmouseenter = () => card.style.transform = 'translateY(-5px)';
            card.onmouseleave = () => card.style.transform = 'translateY(0)';

            // Link  alla Vetrina
            card.onclick = () => window.location.href = `vetrina.html?id=${risto._id}`;

            // Overlay scuro e testo al centro
            card.innerHTML = `
                <div style="position: absolute; top:0; left:0; right:0; bottom:0; background: rgba(17,17,17,0.7); z-index: 1;"></div>
                <div style="position: relative; z-index: 2; text-align: center; color: white; padding: 20px;">
                    <h3 style="font-size: 2.5rem; margin-bottom: 10px; text-shadow: 2px 2px 4px rgba(0,0,0,0.8);">${risto.nome}</h3>
                    <p style="color: #ddd; font-size: 1.1rem; margin-bottom: 10px;">📍 ${risto.indirizzo || 'Indirizzo non specificato'}</p>
                    <button style="background: transparent; border: 2px solid var(--accent-color); color: var(--accent-color); padding: 10px 20px; border-radius: 30px; font-weight: bold; cursor: pointer; transition: 0.3s;" onmouseover="this.style.background='var(--accent-color)'; this.style.color='white';" onmouseout="this.style.background='transparent'; this.style.color='var(--accent-color)';">Esplora il Menu ➔</button>
                </div>
            `;
            track.appendChild(card);
        });
    } catch (error) {
        console.error("Errore ristoranti:", error);
    }
}


// FUNZIONE GLOBALE: CUSTOM ALERTS (TOAST)

function showToast(message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = '🔔';
    if (type === 'success') icon = '✅';
    if (type === 'error') icon = '⚠️';

    toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
    
    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400); 
    }, 3500);
}