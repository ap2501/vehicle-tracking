import express from 'express';
import { connect, Schema, model } from 'mongoose';
import cors from 'cors';

const app = express();
const URL = "mongodb+srv://devg:user@cluster0.vwqjpev.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const dbName = "license_plate_database";
const collectionName = "license_plate_collection";

// Connect to MongoDB
connect(URL, { dbName: dbName })
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => console.error("Error connecting to MongoDB:", err));

// Use the cors middleware
app.use(cors());

// Define schema for the provided data structure
const vehicleSchema = new Schema({
    frame_nmr: { type: Number, required: true },
    car_id: { type: Number, required: true },
    license_plate_text: { type: String, required: true },
    camera_number: { type: String, required: true },
    license_number_score: { type: Number, required: true },
    location: { type: String, required: true },
    timestamp: { type: Date, required: true }
});

// Create model for the provided data structure
const Vehicle = model('Vehicle', vehicleSchema, collectionName); // Specifying collection name 'license_plate_collection'

// Define route to fetch data
app.get('/api/vehicles', async (req, res) => {
    try {
        const { numberPlate } = req.query;
        let query = {};
        if (numberPlate) {
            query = { license_plate_text: numberPlate };
        }
        // Fetch data from the license_plate_collection collection based on the query
        const vehicles = await Vehicle.find(query);
        res.json(vehicles);
    } catch (err) {
        // Handle errors
        res.status(500).json({ message: err.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
