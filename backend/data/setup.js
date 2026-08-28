const fs = require('fs');
const path = require('path');
const Dish = require('../models/Dish');

const extractIngredients = (meal) => {
    const ingredients = [];
    // TheMealDB ha fino a 20 ingredienti
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        if (ingredient && typeof ingredient === 'string' && ingredient.trim() !== '') {
            ingredients.push(ingredient.trim());
        }
    }
    return ingredients;
};

const loadMeals = async () => {
    try {
        // Usa path.join per costruire il percorso corretto 
        const filePath = path.join(__dirname, 'meals.json'); 
        
        // Controlla se il file esiste prima di provare a leggerlo
        if (!fs.existsSync(filePath)) {
            console.log(`⚠️ Attenzione: File non trovato nel percorso ${filePath}`);
            console.log("⚠️ Assicurati di aver inserito il file JSON nella cartella 'backend/data' e che si chiami 'meals.json'.");
            return; // Ferma l'esecuzione dello script ma non blocca il server
        }

        const rawData = fs.readFileSync(filePath, 'utf8');
        const parsedData = JSON.parse(rawData);
        
        // Cerca l'array dei piatti
        const mealsArray = parsedData.meals || parsedData; 

        // Conta i piatti già presenti per evitare di ricaricarli a ogni riavvio
        const count = await Dish.countDocuments({ ristoranteId: null });
        if (count > 0) {
            console.log(`✅ Menu base già presente nel DB (${count} piatti). Skip importazione.`);
            return;
        }

        console.log("⏳ Avvio importazione dei piatti da meals.json...");

        // Mappiamo i dati per il nostro schema Mongoose
        const dishesToInsert = mealsArray.map(meal => ({
            nome: meal.strMeal || meal.name || 'Piatto Sconosciuto',
            tipologia: meal.strCategory || 'Generico',
            prezzo: meal.price || Math.floor(Math.random() * 15) + 5, // Genera un prezzo tra 5 e 20€ se assente
            ingredienti: meal.strIngredient1 ? extractIngredients(meal) : (meal.ingredients || []),
            fotoUrl: meal.strMealThumb || meal.image || '',
            ristoranteId: null // null indica che è un piatto di base comune a tutti
        }));

        // Inserimento massivo nel database
        await Dish.insertMany(dishesToInsert);
        console.log(` Setup completato: ${dishesToInsert.length} piatti caricati nel database!`);

    } catch (error) {
        console.error('❌ Errore durante la fase di setup dei dati:', error);
    }
};

module.exports = loadMeals;