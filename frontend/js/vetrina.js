// frontend/menu/vetrina.js

document.addEventListener('DOMContentLoaded', () => {
    // Leggiamo l'ID del ristorante dall'URL
    const urlParams = new URLSearchParams(window.location.search);
    const ristoranteId = urlParams.get('id');

    if (!ristoranteId) {
        window.location.href = 'menu.html';
        return;
    }

    caricaDettagliRistorante(ristoranteId);
    caricaMenuRistorante(ristoranteId);
});

async function caricaDettagliRistorante(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/restaurants/${id}`);
        if (!response.ok) throw new Error("Ristorante non trovato");

        const risto = await response.json();
        
        document.getElementById('vetrina-nome').innerText = risto.nome;
        document.getElementById('vetrina-indirizzo').innerText = " " + (risto.indirizzo || 'Indirizzo non disponibile');
        
        if (risto.immagine) {
            document.getElementById('vetrina-header').style.backgroundImage = `url('${risto.immagine}')`;
        }
    } catch (error) {
        console.error(error);
        document.getElementById('vetrina-nome').innerText = "Ristorante non trovato ";
        document.getElementById('vetrina-indirizzo').innerText = "Torna indietro e scegline un altro.";
    }
}

async function caricaMenuRistorante(id) {
    const grid = document.getElementById('menu-grid');
    grid.innerHTML = '<p style="color: #888;"> Cottura dei piatti in corso...</p>';

    try {
        const response = await fetch(`http://localhost:3000/api/restaurants/${id}/menu`);
        if (!response.ok) throw new Error("Errore nel caricamento menu");

        const piatti = await response.json();

        if (piatti.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1 / -1; color: var(--text-muted);">Questo ristorante non ha ancora aggiunto piatti al suo menu.</p>';
            return;
        }

        let html = '';
        piatti.forEach(piatto => {
            const imgUrl = piatto.fotoUrl || 'https://via.placeholder.com/400x300?text=Foto+Non+Disponibile';
            // Prepariamo l'oggetto da salvare nel carrello
            const piattoStr = encodeURIComponent(JSON.stringify(piatto));

            html += `
                <div class="dish-card">
                    <img src="${imgUrl}" alt="${piatto.nome}" class="dish-img">
                    <div class="dish-content">
                        <div class="dish-title">${piatto.nome}</div>
                        <div class="dish-ingredients">${piatto.ingredienti || 'Ingredienti segreti del cuoco'}</div>
                        <div class="dish-footer">
                            <div class="dish-price">€ ${piatto.prezzo.toFixed(2)}</div>
                            <button class="btn-add-cart" onclick="aggiungiAlCarrello('${piattoStr}', '${id}')">Aggiungi </button>
                        </div>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    } catch (error) {
        console.error(error);
        grid.innerHTML = '<p style="color: #e74c3c;"> Impossibile caricare il menu.</p>';
    }
}

//  LOGICA DEL CARRELLO  
function aggiungiAlCarrello(piattoJSON, idRistorante) {
    const piatto = JSON.parse(decodeURIComponent(piattoJSON));
    
    let carrello = JSON.parse(localStorage.getItem('fastfood_cart')) || [];

    // Controllo per evitare ordini da ristoranti diversi
    if (carrello.length > 0 && carrello[0].ristoranteId !== idRistorante) {
        // Teniamo il confirm nativo qui perché è una scelta distruttiva 
        const conferma = confirm("Hai già piatti di un altro ristorante nel carrello! Vuoi svuotarlo e ordinare da questo?");
        if (!conferma) return;
        carrello = []; 
    }

    // 2. Controllo se il piatto è già nel carrello (per aumentare la quantità invece di fare un duplicato)
    const piattoEsistente = carrello.find(item => item.id === piatto._id);
    
    if (piattoEsistente) {
        piattoEsistente.quantita = (piattoEsistente.quantita || 1) + 1;
    } else {
        // Se è un piatto nuovo, lo aggiungiamo con quantità 1
        carrello.push({
            id: piatto._id,
            nome: piatto.nome,
            prezzo: piatto.prezzo,
            fotoUrl: piatto.fotoUrl,
            ristoranteId: idRistorante,
            quantita: 1
        });
    }

    // Salviamo il carrello aggiornato
    localStorage.setItem('fastfood_cart', JSON.stringify(carrello));
    
    if (typeof showToast === 'function') {
        showToast(`🛒 ${piatto.nome} aggiunto al carrello!`, "success");
    } else {
        // Fallback di emergenza nel caso il file app.js non si sia caricato
        alert(`✅ ${piatto.nome} aggiunto al carrello!`);
    }
}