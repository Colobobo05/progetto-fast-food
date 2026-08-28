const swaggerUi = require('swagger-ui-express');

const swaggerDocument = {
    openapi: '3.0.0',
    info: {
        title: 'Fast Food API',
        version: '1.0.0',
        description: 'Documentazione ufficiale delle API del progetto Fast Food (A.A. 2025/2026)',
        contact: { name: 'Davide Colombo' }
    },
    servers: [
        { url: 'http://localhost:3000', description: 'Server Locale' }
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
                description: 'Inserisci il token JWT generato al login per testare le rotte protette.'
            }
        }
    },
    paths: {
        '/api/auth/register': {
            post: {
                summary: 'Registra un nuovo utente (Cliente o Ristoratore)',
                tags: ['Autenticazione'],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' }, role: { type: 'string', example: 'Cliente' } } } } } },
                responses: { 201: { description: 'Registrazione completata' }, 400: { description: 'Utente già esistente' } }
            }
        },
        '/api/auth/login': {
            post: {
                summary: 'Effettua il login e ottieni il Token',
                tags: ['Autenticazione'],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { email: { type: 'string' }, password: { type: 'string' } } } } } },
                responses: { 200: { description: 'Login effettuato, Token restituito' }, 400: { description: 'Credenziali non valide' } }
            }
        },
        '/api/restaurants': {
            get: {
                summary: 'Ottieni la lista di tutti i ristoranti',
                tags: ['Ristoranti'],
                responses: { 200: { description: 'Lista ristoranti recuperata con successo' } }
            }
        },
        '/api/restaurants/{id}/menu': {
            get: {
                summary: 'Ottieni il menu di un ristorante specifico',
                tags: ['Ristoranti'],
                parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Menu recuperato' } }
            }
        },
        '/api/orders': {
            post: {
                summary: 'Crea un nuovo ordine',
                tags: ['Ordini (Richiedono Token)'],
                security: [{ bearerAuth: [] }],
                requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { ristoranteId: { type: 'string' }, piatti: { type: 'array', items: { type: 'object', properties: { piattoId: { type: 'string' }, quantita: { type: 'number' } } } } } } } } },
                responses: { 201: { description: 'Ordine creato con successo' } }
            }
        },
        '/api/orders/my-orders': {
            get: {
                summary: 'Ottieni lo storico ordini del Cliente loggato',
                tags: ['Ordini (Richiedono Token)'],
                security: [{ bearerAuth: [] }],
                responses: { 200: { description: 'Ordini recuperati' } }
            }
        },
        '/api/orders/{orderId}/confirm-delivery': {
            put: {
                summary: 'Il Cliente conferma di aver ricevuto l\'ordine',
                tags: ['Ordini (Richiedono Token)'],
                security: [{ bearerAuth: [] }],
                parameters: [{ name: 'orderId', in: 'path', required: true, schema: { type: 'string' } }],
                responses: { 200: { description: 'Ordine segnato come consegnato' } }
            }
        }
    }
};

const setupSwagger = (app) => {
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    console.log(' Swagger Docs disponibili su: http://localhost:3000/api-docs');
};

module.exports = setupSwagger;