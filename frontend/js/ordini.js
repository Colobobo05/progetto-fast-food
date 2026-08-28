// frontend/ordini/ordini.js

// Variabile globale per gestire l'ordine da confermare nel pop-up
let currentOrderToConfirm = null;

document.addEventListener('DOMContentLoaded', () => {
    fetchOrdini();
    inizializzaEventiModal();
});

async function fetchOrdini() {
    const token = localStorage.getItem('fastfood_token');
    if (!token) {
        window.location.href = 'accedi.html';
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/orders/my-orders', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Errore nel recupero degli ordini');

        const ordini = await response.json();
        disegnaOrdini(ordini);

    } catch (error) {
        console.error("Errore fetch ordini:", error);
        document.getElementById('active-orders').innerHTML = '<p style="color:#e74c3c;">Impossibile caricare gli ordini dal server.</p>';
        document.getElementById('past-orders').innerHTML = '';
    }
}

function disegnaOrdini(ordini) {
    const activeContainer = document.getElementById('active-orders');
    const pastContainer = document.getElementById('past-orders');

    activeContainer.innerHTML = '';
    pastContainer.innerHTML = '';

    const inCorso = ordini.filter(o => o.stato !== 'consegnato');
    const passati = ordini.filter(o => o.stato === 'consegnato');

    if (inCorso.length === 0) {
        activeContainer.innerHTML = '<p style="color: var(--text-muted);">Nessun ordine in corso al momento. Hai fame? </p>';
    } else {
        inCorso.forEach(ordine => activeContainer.appendChild(creaCardOrdine(ordine, true)));
    }

    if (passati.length === 0) {
        pastContainer.innerHTML = '<p style="color: var(--text-muted);">Nessun ordine passato.</p>';
    } else {
        passati.forEach(ordine => pastContainer.appendChild(creaCardOrdine(ordine, false)));
    }
}

function creaCardOrdine(ordine, isInCorso) {
    const div = document.createElement('div');
    div.className = 'order-card';

    const coloriStato = {
        'ordinato': '#f39c12',
        'in preparazione': '#3498db',
        'in consegna': '#9b59b6',
        'consegnato': '#2ecc71'
    };

    const dataOrdine = new Date(ordine.createdAt).toLocaleString('it-IT', { 
        day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' 
    });
    
    let piattiHtml = ordine.piatti.map(p => {
        const nomePiatto = p.piattoId ? p.piattoId.nome : 'Piatto non disponibile';
        return `<li style="margin-bottom: 5px;">${p.quantita}x <strong>${nomePiatto}</strong></li>`;
    }).join('');

    let infoAttesa = '';
    if (isInCorso) {
        if (ordine.tipoConsegna === 'ritiro') {
            let minutiAttesaReali = Math.ceil((ordine.tempoAttesaStimato || 15));
            infoAttesa = `<div class="wait-time" style="color: #9b59b6;"> Pronto tra circa: ${minutiAttesaReali} min</div>`;
        } else {
            infoAttesa = `<div class="wait-time" style="color: #3498db;"> Consegna a Domicilio</div>`;
        }
    }

    const totaleSicuro = ordine.totale ? ordine.totale.toFixed(2) : "0.00";

    //  BOTTONE PER CONFERMA RICEZIONE  
    let btnConferma = '';
    if (isInCorso && ordine.stato === 'in consegna') {
        btnConferma = `
            <button onclick="apriModalConferma('${ordine._id}')" style="background: #2ecc71; color: white; border: none; padding: 12px; border-radius: 5px; cursor: pointer; font-weight: bold; width: 100%; margin-top: 15px; font-size: 1.1rem; box-shadow: 0 4px 6px rgba(0,0,0,0.3);">
                ✅ Conferma Ricezione Ordine
            </button>
        `;
    }

    div.innerHTML = `
        <div class="order-header">
            <div>
                <h3 style="margin-bottom: 5px;">Ordine #${ordine._id.substring(ordine._id.length - 6).toUpperCase()}</h3>
                <small style="color: var(--text-muted);">${dataOrdine}</small>
            </div>
            <div>
                <span class="status-badge" style="background-color: ${coloriStato[ordine.stato] || '#333'}; color: white;">
                    ${ordine.stato.toUpperCase()}
                </span>
            </div>
        </div>
        
        <ul style="margin: 15px 0; padding-left: 20px; color: #ddd; list-style-type: disc;">
            ${piattiHtml}
        </ul>
        
        <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #333; padding-top: 15px;">
            <div style="font-weight: bold; font-size: 1.2rem;">Totale: €${totaleSicuro}</div>
            ${infoAttesa}
        </div>
        ${btnConferma} 
    `;

    return div;
}

//  LOGICA MODAL PERSONALIZZATO 

function inizializzaEventiModal() {
    const modal = document.getElementById('confirm-modal');
    const btnAbort = document.getElementById('btn-abort');
    const btnConfirmFinal = document.getElementById('btn-confirm-final');

    if (btnAbort) {
        btnAbort.onclick = () => {
            modal.style.display = 'none';
            currentOrderToConfirm = null;
        };
    }

    if (btnConfirmFinal) {
        btnConfirmFinal.onclick = async () => {
            modal.style.display = 'none';
            if (currentOrderToConfirm) {
                await eseguiChiamataConferma(currentOrderToConfirm);
            }
        };
    }

    // Chiudi cliccando fuori dal contenuto
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
            currentOrderToConfirm = null;
        }
    };
}

function apriModalConferma(orderId) {
    currentOrderToConfirm = orderId;
    const modal = document.getElementById('confirm-modal');
    if (modal) modal.style.display = 'flex';
}

async function eseguiChiamataConferma(orderId) {
    const token = localStorage.getItem('fastfood_token');
    try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}/confirm-delivery`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            if (typeof showToast === 'function') {
                showToast("🎉 Ordine completato! Buon appetito!", "success");
            } else {
                alert("🎉 Ordine completato! Buon appetito!");
            }
            // Ricarica per spostare l'ordine nello storico
            setTimeout(() => fetchOrdini(), 1000); 
        } else {
            const data = await response.json();
            if (typeof showToast === 'function') {
                showToast("⚠️ Errore: " + (data.message || "Impossibile confermare"), "error");
            } else {
                alert("Errore: " + (data.message || "Impossibile confermare"));
            }
        }
    } catch (error) {
        console.error("Errore:", error);
        if (typeof showToast === 'function') showToast("Errore di connessione", "error");
    } finally {
        currentOrderToConfirm = null;
    }
}