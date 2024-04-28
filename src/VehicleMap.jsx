import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

const VehicleMap = () => {
  const [vehicleData, setVehicleData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/vehicles');
        const data = await response.json();
        setVehicleData(data);
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      }
    };

    fetchData();
  }, []);

  const parseLocation = (locationString) => {
    const [latDeg, latMin, latSec, latDir, lngDeg, lngMin, lngSec, lngDir] = locationString.match(/(\d+)°(\d+)'([\d.]+)"([NS])\s(\d+)°(\d+)'([\d.]+)"([EW])/).slice(1).map(parseFloat);

    const latitude = (latDir === 'N' ? 1 : -1) * (latDeg + latMin / 60 + latSec / 3600);
    const longitude = (lngDir === 'E' ? 1 : -1) * (lngDeg + lngMin / 60 + lngSec / 3600);

    return [latitude, longitude];
  };

  const markers = vehicleData.map(vehicle => {
    const [lat, lng] = parseLocation(vehicle.location);
    return { position: [lat, lng], text: vehicle.license_plate_text, id: vehicle._id };
  });

  return (
    <div style={{ height: '500px' }}>
      <MapContainer center={[0, 0]} zoom={2} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {markers.map(marker => (
          <Marker key={marker.id} position={marker.position}>
            <Popup>{marker.text}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default VehicleMap;
