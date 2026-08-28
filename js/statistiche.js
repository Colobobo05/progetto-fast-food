// frontend/statistiche.js

document.addEventListener('DOMContentLoaded', () => {
    fetchStatistiche();
});

async function fetchStatistiche() {
    const token = localStorage.getItem('fastfood_token');
    
    // Sicurezza frontend: se non è Ristoratore, lo cacciamo
    const role = localStorage.getItem('fastfood_role');
    if (!token || role !== 'Ristoratore') {
        window.location.href = 'index.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/orders/restaurant/stats', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Errore nel recupero delle statistiche');

        const stats = await response.json();
        disegnaStatistiche(stats);

    } catch (error) {
        console.error("Errore:", error);
        document.getElementById('stats-content').innerHTML = '<p style="color:#e74c3c; text-align:center;">Impossibile caricare le statistiche.</p>';
    }
}

function disegnaStatistiche(stats) {
    const container = document.getElementById('stats-content');
    
    // Crea la lista dei piatti più venduti
    let piattiVendutiHtml = '';
    if (stats.bestsellers.length > 0) {
        piattiVendutiHtml = stats.bestsellers.map(item => `
            <li>
                <span>🍽️ ${item.piattoInfo.nome}</span>
                <span class="badge-venduti">${item.venduti} porzioni</span>
            </li>
        `).join('');
    } else {
        piattiVendutiHtml = '<p style="color: #888;">Nessun piatto venduto al momento.</p>';
    }

    // Inietta HTML
    container.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card">
                <h3>Ordini Ricevuti</h3>
                <div class="number">${stats.totaleOrdini}</div>
            </div>
            <div class="stat-card" style="border-top-color: #2ecc71;">
                <h3>Incasso Totale</h3>
                <div class="number" style="color: #2ecc71;">€ ${stats.incassoTotale.toFixed(2)}</div>
            </div>
        </div>

        <div class="top-dishes">
            <h2 style="margin-bottom: 20px;">I tuoi Piatti Top </h2>
            <ul>
                ${piattiVendutiHtml}
            </ul>
        </div>
    `;
}