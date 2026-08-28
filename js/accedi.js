// frontend/accedi/accedi.js


//          MOTORE NOTIFICHE 

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

// LOGICA PER MOSTRARE I CAMPI EXTRA SE SI SCEGLIE "CLIENTE"
document.getElementById('reg-role').addEventListener('change', (e) => {
    const extraFields = document.getElementById('extra-client-fields');
    if (e.target.value === 'Cliente') {
        extraFields.style.display = 'block';
    } else {
        extraFields.style.display = 'none';
    }
});

// 1. LOGICA DI REGISTRAZIONE (Colonna Sinistra)
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const ruolo = document.getElementById('reg-role').value;
    const nome = document.getElementById('reg-nome').value;
    const cognome = document.getElementById('reg-cognome').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    // Raccogliamo i dati extra solo se è un Cliente
    let metodoPagamento = null;
    let preferenze = [];

    if (ruolo === 'Cliente') {
        const pagSelect = document.getElementById('reg-pagamento');
        if (pagSelect) metodoPagamento = pagSelect.value;

        const checkboxes = document.querySelectorAll('.reg-pref:checked');
        checkboxes.forEach(cb => preferenze.push(cb.value));
    }

    const btnReg = e.target.querySelector('button');
    const originalText = btnReg.innerText;
    btnReg.innerText = "Attendere...";
    btnReg.disabled = true;

    try {
        const response = await fetch('http://localhost:3000/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                role: ruolo, 
                nome: nome, 
                cognome: cognome, 
                email: email, 
                password: password,
                metodoPagamento: metodoPagamento,
                preferenze: preferenze
            })
        });

        const data = await response.json();

        if (response.ok) {
            showToast("🎉 Registrazione completata! Ora puoi accedere dal riquadro di destra.", "success");
            document.getElementById('register-form').reset(); 
            document.getElementById('extra-client-fields').style.display = 'none'; // Nasconde i campi extra
        } else {
            showToast("⚠️ Errore: " + (data.message || "Email già in uso?"), "error");
        }
    } catch (error) {
        showToast("Nessuna risposta dal server.", "error");
    } finally {
        btnReg.innerText = originalText;
        btnReg.disabled = false;
    }
});

// 2. LOGICA DI ACCESSO (Colonna Destra)
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault(); 

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const btnLogin = e.target.querySelector('button');
    const originalText = btnLogin.innerText;
    btnLogin.innerText = "Accesso in corso...";
    btnLogin.disabled = true;

    try {
        const response = await fetch('http://localhost:3000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: email, password: password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('fastfood_token', data.token);
            
            
            localStorage.setItem('fastfood_role', data.role); 

            const userId = data.userId || (data.user && data.user._id);
            if (userId) localStorage.setItem('fastfood_clienteId', userId);
            
            showToast("Accesso effettuato! Bentornato ", "success");
            
            setTimeout(() => {
                window.location.href = 'index.html'; 
            }, 1000);
        } else {
            showToast(" Errore di accesso: " + (data.message || "Credenziali errate"), "error");
            btnLogin.innerText = originalText;
            btnLogin.disabled = false;
        }
    } catch (error) {
        showToast("Nessuna risposta dal server.", "error");
        btnLogin.innerText = originalText;
        btnLogin.disabled = false;
    }
});