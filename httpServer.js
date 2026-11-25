import http from "http";
import fs from "fs";

const PORT = 3000;
const MENU_FILE_URL = new URL("./public/menu.html", import.meta.url);

const foodItems = [
  { id: 1, foodName: "Pizza", category: "Fast Food", price: 250, availability: true },
  { id: 2, foodName: "Burger", category: "Fast Food", price: 150, availability: true },
  { id: 3, foodName: "Pasta", category: "Italian", price: 200, availability: false }
];

const sendResponse = (res, statusCode, contentType, body) => {
  res.writeHead(statusCode, { "Content-Type": contentType });
  res.end(body);
};

const isValidFoodItem = (data) => {
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

const server = http.createServer((req, res) => {
  const { method } = req;
  const route = req.url.split("?")[0];

  if (method === "GET" && route === "/") {
    const html = "<h1>Welcome to Online Food Ordering</h1><p>Explore our menu and order fresh food online.</p>";
    return sendResponse(res, 200, "text/html", html);
  }

  if (method === "GET" && route === "/about") {
    const html = "<h1>About Us</h1><p>We serve freshly prepared fast food, Italian dishes, and beverages.</p>";
    return sendResponse(res, 200, "text/html", html);
  }

  if (method === "GET" && route === "/foods") {
    const availableFoods = foodItems.filter((item) => item.availability === true);
    return sendResponse(res, 200, "application/json", JSON.stringify(availableFoods));
  }

  if (method === "GET" && route === "/menu") {
    fs.readFile(MENU_FILE_URL, "utf8", (err, content) => {
      if (err) {
        return sendResponse(
          res,
          500,
          "application/json",
          JSON.stringify({ error: "Failed to load menu page" })
        );
      }
      return sendResponse(res, 200, "text/html", content);
    });
    return;
  }

  if (method === "POST" && route === "/add-food") {
    let requestBody = "";

    req.on("data", (chunk) => {
      requestBody += chunk;
    });

    req.on("end", () => {
      let parsedBody;
      try {
        parsedBody = JSON.parse(requestBody);
      } catch {
        return sendResponse(
          res,
          400,
          "application/json",
          JSON.stringify({ error: "Invalid JSON payload" })
        );
      }

      if (!isValidFoodItem(parsedBody)) {
        return sendResponse(
          res,
          400,
          "application/json",
          JSON.stringify({
            error: "Missing or invalid required fields: id, foodName, category, price, availability"
          })
        );
      }

      const newFood = {
        id: parsedBody.id,
        foodName: parsedBody.foodName.trim(),
        category: parsedBody.category.trim(),
        price: parsedBody.price,
        availability: parsedBody.availability
      };

      foodItems.push(newFood);
      return sendResponse(
        res,
        201,
        "application/json",
        JSON.stringify({ message: "Food item added successfully", food: newFood })
      );
    });
    return;
  }

  return sendResponse(
    res,
    404,
    "application/json",
    JSON.stringify({ error: "Route not found" })
  );
});

server.listen(PORT, () => {
  console.log(`HTTP Server running at http://localhost:${PORT}`);
});
