import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { motion } from 'framer-motion';
import { FaSearch, FaCar, FaCamera, FaMapMarkerAlt, FaClock } from 'react-icons/fa';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'; // Import CSS file for styling

function App() {
  const [numberPlate, setNumberPlate] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(false); // State to manage dark mode
  const [markerCoordinates, setMarkerCoordinates] = useState([]);

  const handleChange = (e) => {
    setNumberPlate(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3000/api/vehicles?numberPlate=${numberPlate}`);
      setVehicles(response.data);

      // Set marker coordinates based on the number of rows in the table
      const coordinates = Array.from({ length: response.data.length }, (_, index) => {
        const baseLat = 28.6 + Math.random() * 0.2; // Base latitude with some random variation
        const baseLng = 77.2 + Math.random() * 0.2; // Base longitude with some random variation
        const lat = baseLat + (Math.random() - 0.5) * 0.1; // Add small random offset to latitude
        const lng = baseLng + (Math.random() - 0.5) * 0.1; // Add small random offset to longitude
        return { lat, lng };
      });
      setMarkerCoordinates(coordinates);
    } catch (error) {
      setError('Error fetching data');
    } finally {
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const notify = (message, type = 'info') => {
    toast[type](message, {
      position: 'top-right',
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  return (
    <div className={`flex flex-col min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100'}`}>
      <header className={`py-8 ${darkMode ? 'bg-gray-800' : 'bg-indigo-600'} text-white text-center font-serif`}>
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold">Trackify</h1>
          <p className="text-lg">Effortlessly track any vehicle, anytime.</p>
        </div>
      </header>
      <main className="flex-grow container mx-auto py-8" style={{ width: '75%' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${darkMode ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-md`}
        >
          <form onSubmit={handleSubmit} className="mb-6 flex items-center">
            <FaCar className={`mr-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`} />
            <input
              type="text"
              value={numberPlate}
              onChange={handleChange}
              placeholder="Enter number plate"
              className={`w-full p-2 border rounded-md mb-2 mr-2 focus:outline-none focus:ring focus:border-indigo-500 ${darkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-600'}`}
            />
            <button
              type="submit"
              className={`px-4 py-2 rounded-md focus:outline-none focus:ring focus:border-indigo-500 transition duration-300 ${darkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
              disabled={loading}
            >
              {loading ? <FaSearch className="animate-spin mr-2" /> : <FaSearch className="mr-2" />}
            </button>
          </form>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          {loading ? (
            <SkeletonTheme color="#333333" highlightColor="#444444">
              <Skeleton height={150} count={5} />
            </SkeletonTheme>
          ) : (
            <>
              {vehicles.length > 0 ? (
                <VehicleTable vehicles={vehicles} darkMode={darkMode} />
              ) : (
                <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'} text-center`}>No vehicles found</p>
              )}
            </>
          )}
          <div className="mt-8">
            <MapContainer center={[28.6139, 77.209]} zoom={10} style={{ height: '400px', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {markerCoordinates.map((coordinate, index) => (
                <Marker key={index} position={[coordinate.lat, coordinate.lng]}>
                  <Popup>Vehicle {index + 1}</Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </motion.div>
      </main>
      <footer className={`${darkMode ? 'bg-gray-800' : 'bg-indigo-600'} py-4 text-white text-center font-serif`}>
        <div className="container mx-auto">
          <p>&copy; 2024 Trackify. All rights reserved.</p>
        </div>
      </footer>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="fixed bottom-10 right-10"
      >
        <button
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring focus:border-indigo-500 transition duration-300 ${darkMode ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
          onClick={toggleDarkMode}
        >
          {darkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
      </motion.div>
      <ToastContainer />
    </div>
  );
}

function VehicleTable({ vehicles, darkMode }) {
  return (
    <div className="overflow-x-auto mt-6">
      <table className={`w-full border rounded-lg shadow-md ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-600'}`}>
        <thead className={`${darkMode ? 'bg-gray-700' : 'bg-indigo-600'} text-white`}>
          <tr>
            <th className="py-3 px-6 text-left">
              <div className="flex items-center">
                <FaCar className="mr-2" />
                Number Plate
              </div>
            </th>
            <th className="py-3 px-6 text-left">
              <div className="flex items-center">
                <FaCar className="mr-2" />
                Car ID
              </div>
            </th>
            <th className="py-3 px-6 text-left">
              <div className="flex items-center">
                <FaCamera className="mr-2" />
                Camera Number
              </div>
            </th>
            <th className="py-3 px-6 text-left">
              <div className="flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                Location
              </div>
            </th>
            <th className="py-3 px-6 text-left">
              <div className="flex items-center">
                <FaClock className="mr-2" />
                Date Time
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle, index) => (
            <motion.tr
              key={index}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`${index % 2 === 0 ? (darkMode ? 'bg-gray-700' : 'bg-gray-100') : (darkMode ? 'bg-gray-600' : 'bg-gray-200')}`}
            >
              <td className="py-4 px-6 border-b">{vehicle.license_plate_text}</td>
              <td className="py-4 px-6 border-b">{vehicle.car_id}</td>
              <td className="py-4 px-6 border-b">{vehicle.camera_number}</td>
              <td className="py-4 px-6 border-b">{vehicle.location}</td>
              <td className="py-4 px-6 border-b">{new Date(vehicle.timestamp).toLocaleString()}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default App;
