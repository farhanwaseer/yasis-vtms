import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const center = {
  lat: 24.8607, // Karachi example
  lng: 67.0011,
};

const GoogleMapView = () => {
  const locations = [
    { id: 1, lat: 24.8615, lng: 67.005, type: "green" },
    { id: 2, lat: 24.859, lng: 67.002, type: "red" },
    { id: 3, lat: 24.863, lng: 67.008, type: "green" },
    { id: 4, lat: 24.857, lng: 67.006, type: "red" },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="border-3 border-gray-300 rounded-4xl overflow-hidden shadow-lg">
        <MapContainer
          center={[center.lat, center.lng]}
          zoom={14}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "500px" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((loc) => (
            <Marker
              key={loc.id}
              position={[loc.lat, loc.lng]}
              icon={defaultIcon}
            >
              <Popup>
                <div className="text-sm">
                  <div>Bin #{loc.id}</div>
                  <div className="text-gray-500">{loc.type.toUpperCase()}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default GoogleMapView;
