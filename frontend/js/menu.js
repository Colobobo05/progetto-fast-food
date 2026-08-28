// frontend/menu/menu.js

document.addEventListener('DOMContentLoaded', () => {
    caricaTuttiIRistoranti();
});

async function caricaTuttiIRistoranti() {
    const grid = document.getElementById('all-restaurants-grid');
    const loadingMsg = document.getElementById('loading-msg');

    try {
        // Chiamiamo il backend per avere tutti i ristoranti 
        const response = await fetch('http://localhost:3000/api/restaurants');
        if (!response.ok) throw new Error("Errore nel recupero dei ristoranti");

        const ristoranti = await response.json();
        
        loadingMsg.style.display = 'none';

        if (ristoranti.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); font-size: 1.2rem;">Nessun ristorante ancora registrato sulla piattaforma 😢</p>';
            return;
        }

        let html = '';
        ristoranti.forEach(risto => {
            // Immagine di default se il ristoratore non l'ha messa
            const imgSrc = risto.immagine || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
            
            // Quando si clicca la card, manderemo l'utente alla vetrina del ristorante usando il suo ID
            html += `
                <div class="resto-card" onclick="window.location.href='vetrina.html?id=${risto._id}'">
                    <img src="${imgSrc}" alt="${risto.nome}" class="resto-img" onerror="this.src='https://via.placeholder.com/600x400?text=Foto+Non+Trovata'">
                    <div class="resto-info">
                        <div class="resto-name">${risto.nome}</div>
                        <div class="resto-address"> ${risto.indirizzo || 'Indirizzo non specificato'}</div>
                        <div class="btn-visit">Guarda il Menu ➔</div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;

    } catch (error) {
        console.error(error);
        loadingMsg.innerHTML = '<span style="color: #e74c3c;">⚠️ Impossibile caricare i ristoranti. Riprova più tardi.</span>';
    }
}