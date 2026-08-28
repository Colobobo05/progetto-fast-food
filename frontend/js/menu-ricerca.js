document.addEventListener('DOMContentLoaded', () => {
    // Carica tutti i ristoranti di default all'apertura
    eseguiRicercaRistoranti();

    document.getElementById('form-search-risto').addEventListener('submit', (e) => {
        e.preventDefault();
        eseguiRicercaRistoranti();
    });

    document.getElementById('form-search-piatti').addEventListener('submit', (e) => {
        e.preventDefault();
        eseguiRicercaPiatti();
    });
});

// Gestione visiva delle Tabs
function switchTab(tabName) {
    document.querySelectorAll('.search-panel').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));

    if (tabName === 'risto') {
        document.getElementById('tab-risto').classList.add('active');
        document.querySelectorAll('.tab-btn')[0].classList.add('active');
        eseguiRicercaRistoranti(); // Ricarica i risto
    } else {
        document.getElementById('tab-piatti').classList.add('active');
        document.querySelectorAll('.tab-btn')[1].classList.add('active');
        eseguiRicercaPiatti(); // Ricarica i piatti
    }
}

// Chiamata API Ricerca Ristoranti
async function eseguiRicercaRistoranti() {
    const nome = document.getElementById('srch-risto-nome').value;
    const luogo = document.getElementById('srch-risto-luogo').value;
    
    // Costruisce l'URL con i parametri di query (?nome=...&luogo=...)
    const url = new URL('http://localhost:3000/api/search/restaurants');
    if (nome) url.searchParams.append('nome', nome);
    if (luogo) url.searchParams.append('luogo', luogo);

    try {
        const response = await fetch(url);
        const data = await response.json();
        disegnaRistoranti(data);
    } catch (error) {
        console.error("Errore ricerca:", error);
    }
}

// Chiamata API Ricerca Piatti
async function eseguiRicercaPiatti() {
    const nome = document.getElementById('srch-piatto-nome').value;
    const tipo = document.getElementById('srch-piatto-tipo').value;
    const prezzo = document.getElementById('srch-piatto-prezzo').value;

    const url = new URL('http://localhost:3000/api/search/dishes');
    if (nome) url.searchParams.append('nome', nome);
    if (tipo && tipo !== 'Tutte') url.searchParams.append('tipologia', tipo);
    if (prezzo) url.searchParams.append('prezzoMax', prezzo);

    try {
        const response = await fetch(url);
        const data = await response.json();
        disegnaPiatti(data);
    } catch (error) {
        console.error("Errore ricerca:", error);
    }
}

// Disegna le Card dei Ristoranti
function disegnaRistoranti(ristoranti) {
    const container = document.getElementById('results-container');
    container.innerHTML = '';

    if (ristoranti.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888; width: 100%;">Nessun ristorante trovato con questi criteri.</p>';
        return;
    }

    ristoranti.forEach(risto => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.cursor = 'pointer';
        card.onclick = () => window.location.href = `vetrina.html?id=${risto._id}`;

        const img = risto.immagine || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=500';
        card.innerHTML = `
            <div class="card-image-wrapper"><img src="${img}" alt="${risto.nome}"></div>
            <div class="card-content">
                <div class="card-title">${risto.nome}</div>
                <p style="color: #aaa; margin-top: 10px;"> ${risto.indirizzo || 'Indirizzo non specificato'}</p>
            </div>
        `;
        container.appendChild(card);
    });
}

// Disegna le Card dei Piatti
function disegnaPiatti(piatti) {
    const container = document.getElementById('results-container');
    container.innerHTML = '';

    if (piatti.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #888; width: 100%;">Nessun piatto trovato con questi criteri.</p>';
        return;
    }

    piatti.forEach(piatto => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.cursor = 'pointer';
        card.onclick = () => window.location.href = `piatto.html?piattoId=${piatto._id}`; // Modifica con la tua rotta piatto se diversa

        const img = piatto.fotoUrl || 'https://via.placeholder.com/300x200?text=Foto+Non+Disponibile';
        const nomeRisto = piatto.ristoranteId ? piatto.ristoranteId.nome : 'Ristorante Sconosciuto';
        
        card.innerHTML = `
            <div class="card-image-wrapper"><img src="${img}" alt="${piatto.nome}"></div>
            <div class="card-content">
                <div class="card-title">${piatto.nome}</div>
                <div class="card-category">${piatto.tipologia}</div>
                <p style="color: #aaa; font-size: 0.9rem; margin-top: 5px;"> Venduto da: ${nomeRisto}</p>
                <div class="card-footer" style="margin-top: 15px;">
                    <div class="card-price">€ ${piatto.prezzo.toFixed(2)}</div>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}