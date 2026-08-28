// frontend/carrello.js (o carrello/carrello.js)

document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM Caricato. Avvio renderCart()...");
    renderCart();
    inizializzaLogicaPagamento(); 
});

function renderCart() {
    const container = document.getElementById('cart-container');
    if (!container) return;

   
    let carrello = JSON.parse(localStorage.getItem('fastfood_cart')) || [];
    console.log("Carrello letto:", carrello);

    if (carrello.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: var(--text-muted); padding: 50px;">Il tuo carrello è vuoto. Vai a esplorare i nostri piatti!</p>';
        return;
    }

    let html = '';
    let totale = 0;

    carrello.forEach((item, index) => {
        const prezzoValido = parseFloat(item.prezzo) || 0;
        const quantitaValida = parseInt(item.quantita) || 1;
        const totalePiatto = prezzoValido * quantitaValida;
        totale += totalePiatto;
        
        html += `
            <div class="cart-item">
                <img src="${item.fotoUrl || 'https://via.placeholder.com/150'}" alt="${item.nome}">
                <div class="cart-item-info">
                    <h3>${item.nome}</h3>
                    <p style="color: var(--text-muted);">Quantità: ${quantitaValida} | Prezzo cad: €${prezzoValido.toFixed(2)}</p>
                </div>
                <div style="font-weight: bold; font-size: 1.2rem;">€${totalePiatto.toFixed(2)}</div>
                <button class="btn-remove" onclick="rimuoviPiatto(${index})">X</button>
            </div>`;
    });

    html += `
        <div class="cart-total">Totale Ordine: €${totale.toFixed(2)}</div>
        <button class="btn-checkout" id="btn-procedi-ordine">Procedi all'Ordine ➔</button>`;

    container.innerHTML = html;

    document.getElementById('btn-procedi-ordine').addEventListener('click', procediAlPagamento);
}

function rimuoviPiatto(index) {
    let carrello = JSON.parse(localStorage.getItem('fastfood_cart')) || [];
    carrello.splice(index, 1); 
    localStorage.setItem('fastfood_cart', JSON.stringify(carrello)); 
    renderCart(); 
}

function procediAlPagamento() {
    const token = localStorage.getItem('fastfood_token');
    if (!token) {
        showToast("Devi effettuare l'accesso per poter completare l'ordine!", "error");
        setTimeout(() => {
            window.location.href = 'accedi.html';
        }, 1500);
        return;
    }

    let carrello = JSON.parse(localStorage.getItem('fastfood_cart')) || [];
    if (carrello.length === 0) return;

    let totaleFinale = carrello.reduce((acc, item) => acc + ( (parseFloat(item.prezzo)||0) * (parseInt(item.quantita)||1) ), 0);
    
    const totalBtnEl = document.getElementById('payment-total-btn');
    if(totalBtnEl) totalBtnEl.innerText = totaleFinale.toFixed(2);

    const modal = document.getElementById('payment-modal');
    if(modal) modal.style.display = 'block';
}

function inizializzaLogicaPagamento() {
    const modal = document.getElementById('payment-modal');
    const form = document.getElementById('payment-form');

    if(!modal || !form) return;

    const closeBtn = modal.querySelector('.close-modal');
    if(closeBtn) closeBtn.onclick = () => modal.style.display = 'none';
    window.addEventListener('click', (e) => { if (e.target == modal) modal.style.display = 'none'; });

    //  INPUT FORMATTING 
    const inputNome = document.getElementById('card-name');
    const visualNome = modal.querySelector('.card-holder-name');
    if(inputNome && visualNome) inputNome.addEventListener('input', () => visualNome.innerText = inputNome.value.toUpperCase() || 'NOME COGNOME');

    const inputNumero = document.getElementById('card-number-input');
    const visualNumero = modal.querySelector('.card-number');
    if(inputNumero && visualNumero) {
        inputNumero.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim();
            e.target.value = val;
            visualNumero.innerText = val || '#### #### #### ####';
        });
    }

    const inputScadenza = document.getElementById('card-expiry-input');
    const visualScadenza = modal.querySelector('.card-expiry-date');
    if(inputScadenza && visualScadenza) {
        inputScadenza.addEventListener('input', (e) => {
            let val = e.target.value.replace(/\D/g, '');
            if (val.length >= 2) val = val.substring(0,2) + '/' + val.substring(2,4);
            e.target.value = val;
            visualScadenza.innerText = val || 'MM/YY';
        });
    }

    //  SUBMIT DEL PAGAMENTO 
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btnPaga = document.getElementById('btn-conferma-pagamento');
        btnPaga.innerHTML = ' Elaborazione...';
        btnPaga.disabled = true;

        await new Promise(r => setTimeout(r, 1500)); // Finta attesa banca
        inviaOrdineAlBackend();
    });
}

async function inviaOrdineAlBackend() {
    const token = localStorage.getItem('fastfood_token');
    
    let carrello = JSON.parse(localStorage.getItem('fastfood_cart')) || [];
    let totaleFinale = carrello.reduce((acc, item) => acc + ( (parseFloat(item.prezzo)||0) * (parseInt(item.quantita)||1) ), 0);

    // Formattiamo i piatti per il backend (catturiamo l'ID sia se si chiama _id che id)
    let piattiFormattati = carrello.map(item => {
        return { 
            piattoId: item._id || item.id, 
            quantita: parseInt(item.quantita) || 1 
        };
    });

    // ID RISTORANTE DI DEFAULT o preso dal carrello
    const ristoranteId = carrello[0]?.ristoranteId || "64f1a2b3c4d5e6f7a8b9c0d2"; 

    const nuovoOrdine = {
        ristoranteId: ristoranteId, 
        piatti: piattiFormattati,
        totale: totaleFinale,
        tipoConsegna: "ritiro" 
    };

    try {
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(nuovoOrdine)
        });

        if (response.ok) {
            showToast(" Pagamento autorizzato! Ordine creato con successo.", "success");
            
            // SVUOTIAMO IL CARRELLO CORRETTO
            localStorage.removeItem('fastfood_cart'); 
            document.getElementById('payment-modal').style.display = 'none';
            
            setTimeout(() => {
                window.location.href = 'ordini.html'; 
            }, 1500);
            
        } else {
            const errore = await response.json();
            showToast("Errore: " + errore.message, "error");
            
            const btnPaga = document.getElementById('btn-conferma-pagamento');
            btnPaga.innerHTML = `Paga € ${totaleFinale.toFixed(2)} ➔`;
            btnPaga.disabled = false;
        }
    } catch (error) {
        showToast("Errore di connessione al server.", "error");
        
        const btnPaga = document.getElementById('btn-conferma-pagamento');
        btnPaga.innerHTML = `Paga € ${totaleFinale.toFixed(2)} ➔`;
        btnPaga.disabled = false;
    }
}