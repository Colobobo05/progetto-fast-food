// frontend/gestione-ordini.js

document.addEventListener('DOMContentLoaded', () => {
    fetchOrdiniRistoratore();
});

async function fetchOrdiniRistoratore() {
    const token = localStorage.getItem('fastfood_token');
    if (!token) {
        window.location.href = 'accedi.html';
        return;
    }

    try {
        // Chiamiamo il backend per avere SOLO gli ordini di questo ristorante
        const response = await fetch('http://localhost:3000/api/orders/restaurant', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error('Errore nel recupero degli ordini del ristorante');

        const ordini = await response.json();
        disegnaOrdiniCucina(ordini);

    } catch (error) {
        console.error("Errore fetch ordini cucina:", error);
        document.getElementById('ordini-cucina-container').innerHTML = '<p style="color:#e74c3c; text-align:center;">Impossibile caricare le comande dal server.</p>';
    }
}

function disegnaOrdiniCucina(ordini) {
    const container = document.getElementById('ordini-cucina-container');
    container.innerHTML = '';

    if (ordini.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--text-muted);">Nessun ordine ricevuto al momento. La cucina è tranquilla! </p>';
        return;
    }

    ordini.forEach(ordine => {
        const div = document.createElement('div');
        div.className = 'order-card';

        const dataOrdine = new Date(ordine.createdAt).toLocaleString('it-IT', { 
            day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' 
        });

        let piattiHtml = ordine.piatti.map(p => {
            const nomePiatto = p.piattoId ? p.piattoId.nome : 'Piatto non disponibile';
            return `<li>${p.quantita}x <strong>${nomePiatto}</strong></li>`;
        }).join('');

        // Il nome del cliente
        const nomeCliente = ordine.clienteId ? `${ordine.clienteId.nome} ${ordine.clienteId.cognome}` : 'Cliente Sconosciuto';

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 15px;">
                <div>
                    <h3 style="color: var(--accent-color);">Ordine #${ordine._id.substring(ordine._id.length - 6).toUpperCase()}</h3>
                    <small style="color: #aaa;">Data: ${dataOrdine} | Tipo: <strong>${ordine.tipoConsegna.toUpperCase()}</strong></small>
                </div>
                <div style="text-align: right;">
                    <strong style="color: #fff;">Cliente:</strong> <span style="color: #aaa;">${nomeCliente}</span><br>
                    <strong style="color: #fff;">Totale:</strong> <span style="color: #aaa;">€${ordine.totale.toFixed(2)}</span>
                </div>
            </div>
            
            <ul style="margin-bottom: 20px; color: #ddd;">
                ${piattiHtml}
            </ul>
            
            <div style="background: #2a2a2a; padding: 10px; border-radius: 5px; display: flex; align-items: center; justify-content: space-between;">
                <span style="font-weight: bold;">Stato Attuale:</span>
                <div>
                    <select id="select-stato-${ordine._id}" class="status-select">
                        <option value="ordinato" ${ordine.stato === 'ordinato' ? 'selected' : ''}>🟠 Ordinato (In attesa)</option>
                        <option value="in preparazione" ${ordine.stato === 'in preparazione' ? 'selected' : ''}>🔵 In Preparazione</option>
                        <option value="in consegna" ${ordine.stato === 'in consegna' ? 'selected' : ''}>🟣 In Consegna / Pronto</option>
                        <option value="consegnato" ${ordine.stato === 'consegnato' ? 'selected' : ''}>🟢 Consegnato (Chiuso)</option>
                    </select>
                    <button class="btn-aggiorna" onclick="aggiornaStato('${ordine._id}')">Salva</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

async function aggiornaStato(orderId) {
    const nuovoStato = document.getElementById(`select-stato-${orderId}`).value;
    const token = localStorage.getItem('fastfood_token');

    try {
        const response = await fetch(`http://localhost:3000/api/orders/${orderId}/status`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nuovoStato })
        });

        if (response.ok) {
            showToast('Stato ordine aggiornato con successo!', 'success');
            // Ricarichiamo gli ordini per vedere i colori aggiornati
            setTimeout(() => fetchOrdiniRistoratore(), 1000); 
        } else {
            showToast('Errore durante l\'aggiornamento dello stato.', 'error');
        }
    } catch (error) {
        showToast('Errore di connessione al server.', 'error');
    }
}