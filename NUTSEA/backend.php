<?php
// Database credentials
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "testdb";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Receive the JSON data sent from the frontend
$data = json_decode(file_get_contents('php://input'), true);

// Load the JSON data containing nutrition information
$foodData = json_decode(file_get_contents('FoodData_Central_survey_food_json_2021-10-28.json'), true)['SurveyFoods'];

// Initialize total nutrition values
$totalProtein = 0;
$totalFat = 0;
$totalCarbs = 0;
$totalEnergy = 0;

// Loop through each ingredient and calculate nutrition
foreach ($data['ingredients'] as $ingredient) {
    $foundIngredient = null;

    // Find the ingredient in the loaded JSON data
    foreach ($foodData as $food) {
        if (strtolower($food['description']) === strtolower($ingredient['name'])) {
            $foundIngredient = $food;
            break;
        }
    }

    if ($foundIngredient) {
        // Calculate nutrition based on quantity
        foreach ($foundIngredient['foodNutrients'] as $nutrient) {
            switch ($nutrient['nutrient']['name']) {
                case 'Protein':
                    $totalProtein += $nutrient['amount'] * $ingredient['quantity'] / 100; // Convert to per 100g
                    break;
                case 'Total lipid (fat)':
                    $totalFat += $nutrient['amount'] * $ingredient['quantity'] / 100; // Convert to per 100g
                    break;
                case 'Carbohydrate, by difference':
                    $totalCarbs += $nutrient['amount'] * $ingredient['quantity'] / 100; // Convert to per 100g
                    break;
                case 'Energy':
                    $totalEnergy += $nutrient['amount'] * $ingredient['quantity'] / 100; // Convert to per 100g
                    break;
            }
        }
    } else {
        // Ingredient not found in the database
        echo "Ingredient '{$ingredient['name']}' not found in the database.";
    }
}

// Insert recipe data into the database
$stmt = $conn->prepare("INSERT INTO recipes (dish_name, total_protein, total_fat, total_carbs, total_energy) VALUES (?, ?, ?, ?, ?)");
$stmt->bind_param("sdddd", $data['recipeName'], $totalProtein, $totalFat, $totalCarbs, $totalEnergy);
$stmt->execute();
$stmt->close();

// Close connection
$conn->close();

// Return success message
echo "Recipe data inserted successfully.";
?>
