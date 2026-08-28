const Restaurant = require('../models/Restaurant');
const Dish = require('../models/Dish');

// 1. Ricerca Ristoranti (per luogo, nome o piatto)
exports.searchRestaurants = async (req, res) => {
    try {
        // Estraiamo i parametri dalla query URL (es. /api/search/restaurants?luogo=Milano)
        const { luogo, nome, piatto } = req.query;
        let query = {};

        // Aggiungiamo i filtri se l'utente li ha specificati
        if (luogo) query.luogo = { $regex: luogo, $options: 'i' }; // $options: 'i' rende la ricerca case-insensitive
        if (nome) query.nome = { $regex: nome, $options: 'i' };

        // Troviamo i ristoranti che corrispondono a nome e luogo
        let restaurants = await Restaurant.find(query);

        // Ricerca speciale: Ristorante per piatto
        if (piatto) {
            // Cerchiamo tutti i piatti che hanno quel nome e che sono associati a un ristorante
            const dishes = await Dish.find({ 
                nome: { $regex: piatto, $options: 'i' }, 
                ristoranteId: { $ne: null } 
            });
            
            // Estraiamo gli ID dei ristoranti che hanno quel piatto
            const restaurantIds = dishes.map(d => d.ristoranteId.toString());
            
            // Filtriamo i ristoranti trovati in precedenza mantenendo solo quelli che offrono il piatto cercato
            restaurants = restaurants.filter(r => restaurantIds.includes(r._id.toString()));
        }

        res.json(restaurants);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante la ricerca dei ristoranti.' });
    }
};

// 2. Ricerca Piatti (tipologia, nome, prezzo, ingredienti, allergie)
exports.searchDishes = async (req, res) => {
    try {
        const { tipologia, nome, prezzoMax, ingrediente, allergia } = req.query;
        let query = {};

        if (tipologia) query.tipologia = { $regex: tipologia, $options: 'i' };
        if (nome) query.nome = { $regex: nome, $options: 'i' };
        if (prezzoMax) query.prezzo = { $lte: Number(prezzoMax) }; // $lte = Less Than or Equal (minore o uguale)

        // Ricerca per ingrediente (l'array ingredienti DEVE contenere questa parola)
        if (ingrediente) {
            query.ingredienti = { $regex: ingrediente, $options: 'i' };
        }

        // Ricerca per allergie (l'array ingredienti NON DEVE contenere questa parola)
        if (allergia) {
            query.ingredienti = { 
                ...query.ingredienti, // Mantiene l'eventuale ricerca per ingrediente
                $not: { $regex: allergia, $options: 'i' } 
            };
        }

        // Troviamo i piatti e "popoliamo" i dati del ristorante (se è un piatto specifico di un locale)
        const dishes = await Dish.find(query).populate('ristoranteId', 'nome luogo');
        
        res.json(dishes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Errore durante la ricerca dei piatti.' });
    }
};