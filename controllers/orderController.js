// backend/controllers/orderController.js

const Order = require('../models/Order');
const Dish = require('../models/Dish');
const Restaurant = require('../models/Restaurant');

exports.createOrder = async (req, res) => {
    try {
        const { ristoranteId, piatti, tipoConsegna, indirizzoConsegna } = req.body;
        const clienteId = req.user.userId;

        let totale = 0;
        let tempoPrepOrdineCorrente = 0;

        for (let item of piatti) {
            const piatto = await Dish.findById(item.piattoId);
            if (!piatto) return res.status(404).json({ message: `Piatto ${item.piattoId} non trovato.` });
            
            totale += piatto.prezzo * item.quantita;
            
            // Diamo 5 minuti fissi di preparazione per ogni singola porzione ordinata
            tempoPrepOrdineCorrente += 5 * item.quantita; 
        }

        // Troviamo QUANTI ordini ci sono in coda 
        const ordiniInCoda = await Order.countDocuments({
            ristoranteId,
            stato: { $in: ['ordinato', 'in preparazione'] }
        });
 
        // 10 min base + (5 min per ogni ordine già in coda) + il tempo di cottura dei tuoi piatti
        let tempoAttesaStimato = 10 + (ordiniInCoda * 5) + tempoPrepOrdineCorrente;

        const newOrder = new Order({
            clienteId, 
            ristoranteId, 
            piatti, 
            totale, 
            tipoConsegna,
            indirizzoConsegna: tipoConsegna === 'domicilio' ? indirizzoConsegna : null,
            tempoAttesaStimato
        });

        await newOrder.save();

        res.status(201).json({ 
            message: 'Ordine creato con successo!', 
            ordine: newOrder,
            dettagli: `Tempo stimato: ${tempoAttesaStimato} minuti. Importo: €${totale}`
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante la creazione dell\'ordine.' });
    }
};

exports.updateOrderStatus = async (req, res) => {
    try {
        const { orderId } = req.params;
        const { nuovoStato } = req.body;

        const validStates = ['ordinato', 'in preparazione', 'in consegna', 'consegnato'];
        if (!validStates.includes(nuovoStato)) {
            return res.status(400).json({ message: 'Stato non valido.' });
        }

        // ECCO LA MODIFICA PER IL WARNING DI MONGOOSE: { returnDocument: 'after' }
        const ordine = await Order.findByIdAndUpdate(
            orderId, 
            { stato: nuovoStato }, 
            { returnDocument: 'after' } 
        );
        
        if (!ordine) return res.status(404).json({ message: 'Ordine non trovato.' });

        res.json({ message: `Stato ordine aggiornato a: ${nuovoStato}`, ordine });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante l\'aggiornamento.' });
    }
};

exports.getCustomerOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const orders = await Order.find({ clienteId: userId })
            .sort({ createdAt: -1 })
            .populate('ristoranteId', 'nome luogo')
            .populate('piatti.piattoId', 'nome prezzo');
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero degli ordini.' });
    }
};

exports.getRestaurantOrders = async (req, res) => {
    try {
        const userId = req.user.userId;
        const restaurant = await Restaurant.findOne({ userId });
        if (!restaurant) return res.status(404).json({ message: 'Nessun ristorante associato a questo utente.' });

        const orders = await Order.find({ ristoranteId: restaurant._id })
            .sort({ createdAt: -1 })
            .populate('clienteId', 'nome cognome email')
            .populate('piatti.piattoId', 'nome prezzo');
        
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero degli ordini.' });
    }
};

exports.getBestsellers = async (req, res) => {
    try {
        const bestsellers = await Order.aggregate([
            { $unwind: "$piatti" },
            { $group: { _id: "$piatti.piattoId", totaleVenduti: { $sum: "$piatti.quantita" } } },
            { $sort: { totaleVenduti: -1 } },
            { $limit: 3 },
            { $lookup: { 
                from: "dishes", 
                localField: "_id",
                foreignField: "_id",
                as: "piattoInfo"
            }},
            { $unwind: "$piattoInfo" }
        ]);

        if (bestsellers.length === 0) {
            const fallbackDishes = await Dish.find({ ristoranteId: null }).limit(3);
            const formattedFallback = fallbackDishes.map(d => ({ piattoInfo: d, totaleVenduti: 0 }));
            return res.json(formattedFallback);
        }

        res.json(bestsellers);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel recupero dei bestseller.' });
    }
};

//  Il Cliente conferma la ricezione ---
exports.confirmDelivery = async (req, res) => {
    try {
        const { orderId } = req.params;
        const userId = req.user.userId; 

        const ordine = await Order.findOneAndUpdate(
            { _id: orderId, clienteId: userId }, 
            { stato: 'consegnato' }, 
            { returnDocument: 'after' }
        );

        if (!ordine) return res.status(404).json({ message: 'Ordine non trovato o non sei autorizzato.' });

        res.json({ message: 'Ordine confermato come consegnato! Buon appetito!', ordine });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante la conferma di consegna.' });
    }
};
//  Statistiche del Ristorante ---
exports.getRestaurantStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const restaurant = await Restaurant.findOne({ userId });
        
        if (!restaurant) {
            return res.status(404).json({ message: 'Nessun ristorante associato a questo utente.' });
        }

        // 1. Troviamo tutti gli ordini del ristorante
        const orders = await Order.find({ ristoranteId: restaurant._id });

        // 2. Calcoliamo il totale degli ordini e l'incasso totale
        const totaleOrdini = orders.length;
        const incassoTotale = orders.reduce((acc, order) => acc + (order.totale || 0), 0);

        // 3. Troviamo i 5 piatti più venduti di QUESTO ristorante
        const bestsellers = await Order.aggregate([
            { $match: { ristoranteId: restaurant._id } }, // Filtra solo per questo ristorante
            { $unwind: "$piatti" },
            { $group: { _id: "$piatti.piattoId", venduti: { $sum: "$piatti.quantita" } } },
            { $sort: { venduti: -1 } },
            { $limit: 5 },
            { $lookup: { 
                from: "dishes", 
                localField: "_id",
                foreignField: "_id",
                as: "piattoInfo"
            }},
            { $unwind: "$piattoInfo" }
        ]);

        res.json({ totaleOrdini, incassoTotale, bestsellers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore nel calcolo delle statistiche.' });
    }
};