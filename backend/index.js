const port = 4000;
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require("path");
const cors = require('cors');


app.use(express.json());
app.use(cors());

//database connection with mongoose
mongoose.connect("mongodb+srv://rejebchadi:chadi123@ecommerce.uumtv.mongodb.net/?retryWrites=true&w=majority&appName=Ecommerce")

// API Creation

app.get("/", (req , res) => {
    res.send("Express app is running");
})

app.listen(port , (err) => {
    if(!err){
        console.log("server running on port: " + port);
    }else {
        throw err;
        console.log("Error on port: " + err);
    }
})