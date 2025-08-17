const apiKey = 'API'; 

function searchRecipe() {
    const recipeName = document.getElementById('recipe').value;
    fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${recipeName}&dataType=SR Legacy`)
        .then(response => response.json())
        .then(data => {
            const foods = data.foods;
            if (foods && foods.length > 0) {
                const food = foods[0];
                const nutrients = food.foodNutrients;
                let resultHtml = `<h2>${food.description}</h2>`;
                resultHtml += '<ul>';
                nutrients.forEach(nutrient => {
                    resultHtml += `<li>${nutrient.nutrientName}: ${nutrient.value} ${nutrient.unitName}</li>`;
                });
                resultHtml += '</ul>';
                document.getElementById('result').innerHTML = resultHtml;
            } else {
                document.getElementById('result').innerHTML = 'Recipe not found.';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('result').innerHTML = 'An error occurred. Please try again.';
        });
}


// Global variable to store the loaded JSON data
let foodData;

// Load the JSON data
fetch('FoodData_Central_survey_food_json_2021-10-28.json')
    .then(response => response.json())
    .then(data => {
        foodData = data.SurveyFoods;
    });

// Function to calculate nutrition
function calculateNutrition() {
    const recipeName = document.getElementById("recipeName").value;
    let totalProtein = 0;
    let totalFat = 0;
    let totalCarbs = 0;
    let totalEnergy = 0;

    for (let i = 1; i <= ingredientIndex; i++) {
        const ingredient = document.getElementById(`ingredient${i}`).value;
        const quantity = parseFloat(document.getElementById(`quantity${i}`).value);
        const unit = document.getElementById(`unit${i}`).value;

        // Find the ingredient in the loaded JSON data
        const foundIngredient = foodData.find(data => data.description.toLowerCase() === ingredient.toLowerCase());

        if (foundIngredient) {
            // Calculate nutrition based on quantity
            const foodNutrients = foundIngredient.foodNutrients;
            const proteinNutrient = foodNutrients.find(nutrient => nutrient.nutrient.name === "Protein");
            const fatNutrient = foodNutrients.find(nutrient => nutrient.nutrient.name === "Total lipid (fat)");
            const carbsNutrient = foodNutrients.find(nutrient => nutrient.nutrient.name === "Carbohydrate, by difference");
            const energyNutrient = foodNutrients.find(nutrient => nutrient.nutrient.name === "Energy");

            totalProtein += (proteinNutrient ? proteinNutrient.amount : 0) * quantity;
            totalFat += (fatNutrient ? fatNutrient.amount : 0) * quantity;
            totalCarbs += (carbsNutrient ? carbsNutrient.amount : 0) * quantity;
            totalEnergy += (energyNutrient ? energyNutrient.amount : 0) * quantity;
        } else {
            console.log(`Ingredient '${ingredient}' not found in the database.`);
        }
    }

    document.getElementById("result2").innerHTML = `
        <strong>Total Protein:</strong> ${totalProtein.toFixed(2)}g<br>
        <strong>Total Fat:</strong> ${totalFat.toFixed(2)}g<br>
        <strong>Total Carbs:</strong> ${totalCarbs.toFixed(2)}g<br>
        <strong>Total Energy:</strong> ${totalEnergy.toFixed(2)} kcal<br>
    `;
}

let ingredientIndex = 1;

function addIngredient() {
    ingredientIndex++;
    const ingredientsDiv = document.getElementById("ingredients");
    const newIngredientDiv = document.createElement("div");
    newIngredientDiv.innerHTML = `
        <label for="ingredient${ingredientIndex}" style="text-align: center">Ingredient ${ingredientIndex}:</label>
        <input type="text" id="ingredient${ingredientIndex}" name="ingredient${ingredientIndex}" placeholder="Ingredient Name">
        <input type="number" id="quantity${ingredientIndex}" name="quantity${ingredientIndex}" placeholder="Quantity">
        <select id="unit${ingredientIndex}" name="unit${ingredientIndex}">
            <option value="g">g</option>
            <option value="kg">kg</option>
            <option value="ml">ml</option>
            <option value="l">l</option>
        </select>
        <br><br>
    `;
    ingredientsDiv.appendChild(newIngredientDiv);
}
