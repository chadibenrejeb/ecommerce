const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require("path");
const cors = require('cors');
const fs = require('fs');
const bcrypt = require('bcrypt');

app.use(express.json());
app.use(cors());

// Ensure the upload directory exists
const uploadDir = './upload/images';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

mongoose.connect("mongodb+srv://rejebchadi:chadi123@ecommerce.uumtv.mongodb.net/?retryWrites=true&w=majority&appName=Ecommerce", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

// API Creation
app.get("/", (req, res) => {
    res.send("Express app is running");
});

// Image Storage Engine
const storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

// Creating Upload Endpoints for images
app.use('/images', express.static(uploadDir));

app.post("/upload", upload.single("product"), (req, res) => {
    res.json({
        success: 1,
        image_url: `http://localhost:${port}/images/${req.file.filename}`
    });
});

// Schema for Creating products
const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    new_price: {
        type: Number,
        required: true
    },
    old_price: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    available: {
        type: Boolean,
        default: true
    }
});

// Adding a product
app.post("/addproduct", async (req, res) => {
    try {
        let products = await Product.find({});
        let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

        const product = new Product({
            id: id,
            name: req.body.name,
            image: req.body.image,
            category: req.body.category,
            new_price: req.body.new_price,
            old_price: req.body.old_price,
        });

        await product.save();
        res.status(201).json({
            success: true,
            name: req.body.name,
        });
    } catch (err) {
        console.error("Error adding product:", err);
        res.status(500).json({ success: false, message: "Error adding product" });
    }
});

// Removing a product
app.post('/removeproduct', async (req, res) => {
    try {
        await Product.findOneAndDelete({
            id: req.body.id,
        });
        res.status(200).json({
            success: true,
            id: req.body.id,
        });
    } catch (err) {
        console.error("Error removing product:", err);
        res.status(500).json({ success: false, message: "Error removing product" });
    }
});

// Getting all products
app.get("/allproducts", async (req, res) => {
    try {
        let products = await Product.find({});
        res.status(200).json({
            success: true,
            data: products
        });
    } catch (err) {
        console.error("Error fetching products:", err);
        res.status(500).json({
            success: false,
            message: "Error fetching products"
        });
    }
});

// Schema creation for User model
const Users = mongoose.model("Users", {
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    cartData: {
        type: Map,
        of: Number,
        default: new Map(),

    },
    date: {
        type: Date,
        default: Date.now
    }
});

// Registering a new user
app.post('/signup', async (req, res) => {
    try {
        let check = await Users.findOne({ email: req.body.email });
        if (check) {
            return res.status(400).json({
                success: false,
                errors: "User already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        const user = new Users({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword,
            cartData: {}, // Initialize an empty cart
        });

        await user.save();

        const data = {
            user: {
                id: user._id
            }
        };

        const token = jwt.sign(data, 'secret_ecom');
        res.json({ success: true, token });
    } catch (err) {
        console.error("Error signing up:", err);
        res.status(500).json({ success: false, message: "Error signing up" });
    }
});

// Logging in a user
app.post('/login', async (req, res) => {
    try {
        let user = await Users.findOne({ email: req.body.email });
        if (user) {
            const passCompare = await bcrypt.compare(req.body.password, user.password);
            if (passCompare) {
                const data = {
                    user: {
                        id: user._id
                    }
                };
                const token = jwt.sign(data, 'secret_ecom');
                res.json({
                    success: true,
                    token
                });
            } else {
                res.status(400).json({
                    success: false,
                    errors: "Password is incorrect"
                });
            }
        } else {
            res.status(400).json({
                success: false,
                errors: "Wrong email"
            });
        }
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).json({ success: false, message: "Error logging in" });
    }
});

// Getting new collections
app.get('/newcollections', async (req, res) => {
    try {
        let products = await Product.find({});
        let newcollection = products.slice(1).slice(-8);
        res.send(newcollection);
    } catch (err) {
        console.error("Error fetching new collections:", err);
        res.status(500).json({ success: false, message: "Error fetching new collections" });
    }
});

// Getting popular products in the women section
app.get('/popularwomen', async (req, res) => {
    try {
        let products = await Product.find({ category: "women" });
        let popular_woman = products.slice(0, 4);
        res.send(popular_woman);
    } catch (err) {
        console.error("Error fetching popular women products:", err);
        res.status(500).json({ success: false, message: "Error fetching popular women products" });
    }
});

// Middleware to fetch user
const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send({ errors: "Please Log in" });
    } else {
        try {
            const data = jwt.verify(token, 'secret_ecom');
            req.user = data.user;
            next(); // Proceed to the next middleware or route handler
        } catch (error) {
            return res.status(401).send({ errors: "Please authenticate using a valid token" });
        }
    }
}

// Add to cart (implement this according to your requirements)
app.post('/addtocart', fetchUser, async (req, res) => {
    try {
        console.log("Added " , req.body.itemId);

        let userData = await Users.findById(req.user.id);

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Convert the itemId to a string before using it as a key
        const itemId = String(req.body.itemId);

        // Initialize itemId if it doesn't exist in cartData
        if (!userData.cartData.has(itemId)) {
            userData.cartData.set(itemId, 0);
        }

        userData.cartData.set(itemId, userData.cartData.get(itemId) + 1);

        await userData.save();

        res.status(200).json({ success: true, message: "Item added to cart" });
    } catch (err) {
        console.error("Error adding item to cart:", err);
        res.status(500).json({ success: false, message: "Error adding item to cart" });
    }
});

//creatin endpoint to remove item from cartdata
app.post('/removefromcart', fetchUser, async (req, res) => {
    try {
        console.log("removed", req.body.itemId);

        // Find the user by ID
        let userData = await Users.findById(req.user.id);

        if (!userData) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const itemId = String(req.body.itemId);

        // Check if the item exists in the cart
        if (userData.cartData.has(itemId)) {
            const currentQuantity = userData.cartData.get(itemId);

            if (currentQuantity > 1) {
                // Decrement the quantity if it's greater than 1
                userData.cartData.set(itemId, currentQuantity - 1);
            } else {
                // Remove the item from the cart if the quantity is 1 or less
                userData.cartData.delete(itemId);
            }

            // Save the updated cartData back to the database
            await userData.save();

            res.status(200).json({ success: true, message: "Item removed from cart" });
        } else {
            res.status(400).json({ success: false, message: "Item not found in cart" });
        }
    } catch (err) {
        console.error("Error removing item from cart:", err);
        res.status(500).json({ success: false, message: "Error removing item from cart" });
    }
});

app.listen(port, (err) => {
    if (!err) {
        console.log("Server running on port: " + port);
    } else {
        console.error("Error on port:", err);
    }
});
