import express from "express";

const app = express();
const PORT = 4000;

app.use(express.json());

const foodItems = [
  { id: 1, foodName: "Pizza", category: "Fast Food", price: 250, availability: true },
  { id: 2, foodName: "Burger", category: "Fast Food", price: 150, availability: true },
  { id: 3, foodName: "Pasta", category: "Italian", price: 200, availability: false }
];

const isValidNewFood = (data) => {
  if (!data || typeof data !== "object") {
    return false;
  }
  const { id, foodName, category, price, availability } = data;
  return (
    id !== undefined &&
    id !== null &&
    typeof foodName === "string" &&
    foodName.trim() !== "" &&
    typeof category === "string" &&
    category.trim() !== "" &&
    typeof price === "number" &&
    price > 0 &&
    typeof availability === "boolean"
  );
};

app.get("/foods", (req, res) => {
  res.json(foodItems);
});

app.get("/foods/:id", (req, res) => {
  const foodId = Number(req.params.id);
  if (Number.isNaN(foodId)) {
    return res.status(400).json({ error: "Invalid food ID" });
  }

  const food = foodItems.find((item) => item.id === foodId);
  if (!food) {
    return res.status(404).json({ error: "Food item not found" });
  }

  return res.json(food);
});

app.post("/foods", (req, res) => {
  if (!isValidNewFood(req.body)) {
    return res.status(400).json({
      error: "Missing required fields or price is not a positive number"
    });
  }

  const newFood = {
    id: req.body.id,
    foodName: req.body.foodName.trim(),
    category: req.body.category.trim(),
    price: req.body.price,
    availability: req.body.availability
  };

  foodItems.push(newFood);
  return res.status(201).json({
    message: "Food item added successfully",
    food: newFood
  });
});

app.put("/foods/:id", (req, res) => {
  const foodId = Number(req.params.id);
  if (Number.isNaN(foodId)) {
    return res.status(400).json({ error: "Invalid food ID" });
  }

  const food = foodItems.find((item) => item.id === foodId);
  if (!food) {
    return res.status(404).json({ error: "Food item not found" });
  }

  const { foodName, category, price, availability } = req.body || {};
  const hasAnyField =
    foodName !== undefined ||
    category !== undefined ||
    price !== undefined ||
    availability !== undefined;

  if (!hasAnyField) {
    return res.status(400).json({ error: "Required fields are missing" });
  }

  if (foodName !== undefined && (typeof foodName !== "string" || foodName.trim() === "")) {
    return res.status(400).json({ error: "Invalid foodName" });
  }
  if (category !== undefined && (typeof category !== "string" || category.trim() === "")) {
    return res.status(400).json({ error: "Invalid category" });
  }
  if (price !== undefined && (typeof price !== "number" || price <= 0)) {
    return res.status(400).json({ error: "Price must be a positive number" });
  }
  if (availability !== undefined && typeof availability !== "boolean") {
    return res.status(400).json({ error: "Availability must be a boolean" });
  }

  if (foodName !== undefined) food.foodName = foodName.trim();
  if (category !== undefined) food.category = category.trim();
  if (price !== undefined) food.price = price;
  if (availability !== undefined) food.availability = availability;

  return res.json({
    message: "Food item updated successfully",
    food
  });
});

app.delete("/foods/:id", (req, res) => {
  const foodId = Number(req.params.id);
  if (Number.isNaN(foodId)) {
    return res.status(400).json({ error: "Invalid food ID" });
  }

  const index = foodItems.findIndex((item) => item.id === foodId);
  if (index === -1) {
    return res.status(404).json({ error: "Food item not found" });
  }

  const [deletedFood] = foodItems.splice(index, 1);
  return res.json({
    message: "Food item deleted successfully",
    food: deletedFood
  });
});

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    return res.status(400).json({ error: "Invalid JSON payload" });
  }
  return next(err);
});

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

app.listen(PORT, () => {
  console.log(`Express Server running at http://localhost:${PORT}`);
});
