import React, { useState } from 'react';
import axios from 'axios';
import { FaSearch, FaCar } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

function Map() {
  const [numberPlate, setNumberPlate] = useState('');
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [locations, setLocations] = useState([]);

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
      const locations = response.data.map(vehicle => vehicle.location);
      
      // Extract coordinates from location strings
      const coordinates = locations.map(location => {
        const [latitude, longitude] = location.split(' '); // Split the string by space
        const latitudeArray = latitude.match(/(\d+)°(\d+)'(\d+\.\d+)"([NS])/); // Match latitude pattern
        const longitudeArray = longitude.match(/(\d+)°(\d+)'(\d+\.\d+)"([EW])/); // Match longitude pattern

        // Convert coordinates to suitable types
        const lat = parseFloat(latitudeArray[1]) + parseFloat(latitudeArray[2]) / 60 + parseFloat(latitudeArray[3]) / 3600;
        const lng = parseFloat(longitudeArray[1]) + parseFloat(longitudeArray[2]) / 60 + parseFloat(longitudeArray[3]) / 3600;

        // Adjust for direction (N/S, E/W)
        const adjustedLat = latitudeArray[4] === 'S' ? -lat : lat;
        const adjustedLng = longitudeArray[4] === 'W' ? -lng : lng;

        return { lat: adjustedLat, lng: adjustedLng };
      });
      
      setLocations(coordinates);
    } catch (error) {
      setError('Error fetching data');  
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto">
      <form onSubmit={handleSubmit} className="mb-6 flex items-center">
        <FaCar className="mr-2" />
        <input
          type="text"
          value={numberPlate}
          onChange={handleChange}
          placeholder="Enter number plate"
          className="w-full p-2 border rounded-md mb-2 mr-2 focus:outline-none focus:ring focus:border-indigo-500"
        />
        <button
          type="submit"
          className="px-4 py-2 rounded-md focus:outline-none focus:ring focus:border-indigo-500 transition duration-300 bg-blue-500 text-white hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? <FaSearch className="animate-spin mr-2" /> : <FaSearch className="mr-2" />}
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      <MapContainer center={[0, 0]} zoom={2} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {locations.map((location, index) => (
          <Marker key={index} position={[location.lat, location.lng]}>
            <Popup>
              Vehicle {index + 1}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default Map;
