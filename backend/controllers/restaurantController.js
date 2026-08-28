const Restaurant = require('../models/Restaurant');
const Dish = require('../models/Dish');
const fs = require('fs');
const path = require('path');

// =========================================================
//      Configura o aggiorna il profilo del ristorante
// =========================================================
exports.setupRestaurant = async (req, res) => {
    try {
        // Aggiunti 'immagine' e 'descrizione' per catturarli dal frontend
        const { nome, telefono, partitaIva, indirizzo, luogo, immagine, descrizione } = req.body;
        const userId = req.user.userId;

        let restaurant = await Restaurant.findOne({ userId });
        
        // Se il ristorante esiste già, lo aggiorniamo
        if (restaurant) {
            restaurant.nome = nome || restaurant.nome;
            restaurant.telefono = telefono || restaurant.telefono;
            restaurant.partitaIva = partitaIva || restaurant.partitaIva;
            restaurant.indirizzo = indirizzo || restaurant.indirizzo;
            restaurant.luogo = luogo || restaurant.luogo;
            restaurant.immagine = immagine || restaurant.immagine; // Salviamo l'immagine
            restaurant.descrizione = descrizione || restaurant.descrizione; // Salviamo la descrizione
            await restaurant.save();
            return res.json({ message: 'Ristorante aggiornato!', restaurant });
        }

        // Se non esiste, lo creiamo da zero passando tutti i campi
        restaurant = new Restaurant({ 
            userId, 
            nome, 
            telefono, 
            partitaIva, 
            indirizzo, 
            luogo,
            immagine, // <-- Aggiunto
            descrizione // <-- Aggiunto
        });
        
        await restaurant.save();
        res.status(201).json({ message: 'Ristorante creato!', restaurant });
    } catch (error) {
        console.error("Errore setup ristorante:", error);
        res.status(500).json({ message: 'Errore del server durante la creazione del ristorante.' });
    }
};

// =========================================================
//          Aggiunge un piatto personalizzato
// =========================================================
exports.addCustomDish = async (req, res) => {
    try {
        const { nome, tipologia, prezzo, ingredienti, fotoUrl } = req.body;
        const userId = req.user.userId;

        const restaurant = await Restaurant.findOne({ userId });
        if (!restaurant) return res.status(404).json({ message: 'Ristorante non trovato.' });

        const newDish = new Dish({ nome, tipologia, prezzo, ingredienti, fotoUrl, ristoranteId: restaurant._id });
        await newDish.save();
        res.status(201).json({ message: 'Piatto aggiunto!', dish: newDish });
    } catch (error) {
        res.status(500).json({ message: 'Errore del server.' });
    }
};

// =========================================================
//          Aggiunge un piatto base dal DB comune
// =========================================================
exports.addCommonDishToMenu = async (req, res) => {
    try {
        const { commonDishId } = req.body;
        const userId = req.user.userId;

        const restaurant = await Restaurant.findOne({ userId });
        if (!restaurant) return res.status(404).json({ message: 'Ristorante non trovato.' });

        const commonDish = await Dish.findById(commonDishId);
        if (!commonDish || commonDish.ristoranteId !== null) {
            return res.status(404).json({ message: 'Piatto base non trovato.' });
        }

        const menuDish = new Dish({
            nome: commonDish.nome, tipologia: commonDish.tipologia, prezzo: commonDish.prezzo, 
            ingredienti: commonDish.ingredienti, fotoUrl: commonDish.fotoUrl, ristoranteId: restaurant._id
        });
        await menuDish.save();
        res.status(201).json({ message: 'Piatto base aggiunto al menu!', dish: menuDish });
    } catch (error) {
        res.status(500).json({ message: 'Errore del server.' });
    }
};

// =========================================================
//         Ottieni la lista dei ristoranti per la Home
// =========================================================
exports.getAllRestaurants = async (req, res) => {
    try {
        // 1. Cerca ristoranti VERI nel database
        const ristorantiVeri = await Restaurant.find();

        // Se ce ne sono, manda quelli!
        if (ristorantiVeri.length > 0) {
            return res.json(ristorantiVeri);
        }

        // 2. Se il DB è vuoto, invia questi 3 finti per far funzionare il carosello
        const ristorantiFinti = [
            { 
                _id: 'pizza-123', 
                nome: 'pizza e pizza ', 
                indirizzo: 'Via Roma, 1 - Milano', 
                immagine: 'https://www.accademia-pizzaioli.it/wp-content/uploads/2016/03/10-curiosita-pizza.jpg' 
            },
            { 
                _id: 'burger-456', 
                nome: 'Burger burger', 
                indirizzo: 'Piazza Duomo, 1 - Milano', 
                immagine: 'https://www.foodandwine.com/thmb/XE8ubzwObCIgMw7qJ9CsqUZocNM=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/MSG-Smash-Burger-FT-RECIPE0124-d9682401f3554ef683e24311abdf342b.jpg' 
            },
            { 
                _id: 'dolce-789', 
                nome: 'mr dolcetto ', 
                indirizzo: 'Via Garibaldi, 1 - Milano', 
                immagine:'https://www.pasticceriacioccolateria.it/wp-content/uploads/2023/09/mousse-cioccolato-vaniglia-torta-pasticceria-cioccolateria-dolce-bassano-del-grappa-04-2048x1365.webp'
            }
        ];
        
        res.json(ristorantiFinti);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero dei ristoranti', error: error.message });
    }
};

// =========================================================
//         Leggi il file meal.json e invialo al sito
// =========================================================
exports.getCommonMeals = (req, res) => {
    try {
        // Cerca il file nella cartella 'data'
        const filePath = path.join(__dirname, '../data/meals.json');
        const fileData = fs.readFileSync(filePath, 'utf8');
        const meals = JSON.parse(fileData);
        
        res.json(meals);
    } catch (error) {
        console.error("Errore lettura meal.json:", error);
        res.status(500).json({ message: 'Errore nel caricamento del catalogo base.' });
    }
};

// =========================================================
//   Ottieni i dettagli di un singolo ristorante tramite ID
// =========================================================
exports.getRestaurantById = async (req, res) => {
    try {
        const restaurant = await Restaurant.findById(req.params.id);
        if (!restaurant) return res.status(404).json({ message: 'Ristorante non trovato' });
        res.json(restaurant);
    } catch (error) {
        res.status(404).json({ message: 'Ristorante non trovato' });
    }
};

// =========================================================
//          Ottieni il menu di un singolo ristorante
// =========================================================
exports.getRestaurantMenu = async (req, res) => {
    try {
        const menu = await Dish.find({ ristoranteId: req.params.id });
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero del menu' });
    }
};
// =========================================================
// Ottieni il menu del PROPRIO ristorante (Per la Dashboard)
// =========================================================
exports.getMyMenu = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ userId: req.user.userId });
        if (!restaurant) return res.status(404).json({ message: 'Ristorante non trovato' });
        
        const menu = await Dish.find({ ristoranteId: restaurant._id });
        res.json(menu);
    } catch (error) {
        res.status(500).json({ message: 'Errore nel recupero del menu' });
    }
};

// =========================================================
//           Elimina un piatto dal proprio menu
// =========================================================
exports.deleteDish = async (req, res) => {
    try {
        const restaurant = await Restaurant.findOne({ userId: req.user.userId });
        if (!restaurant) return res.status(404).json({ message: 'Ristorante non trovato' });

        const dishId = req.params.dishId;
        // Elimina solo se il piatto appartiene a questo ristorante!
        const deletedDish = await Dish.findOneAndDelete({ _id: dishId, ristoranteId: restaurant._id });
        
        if (!deletedDish) return res.status(404).json({ message: 'Piatto non trovato' });
        
        res.json({ message: 'Piatto eliminato con successo!' });
    } catch (error) {
        res.status(500).json({ message: 'Errore durante l\'eliminazione' });
    }
};