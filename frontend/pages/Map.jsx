import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap
} from "react-leaflet";

import "leaflet/dist/leaflet.css";
import L from "leaflet";

import { useState } from "react";

// Fix Leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


// Store location
const STORE_LOCATION = [7.0084, 100.4747];


// Component for current location
function LocateMe({ setUserLocation }) {

  const map = useMap();

  const findLocation = () => {

    if (!navigator.geolocation) {
      alert("Your browser does not support location.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {

        const location = [
          position.coords.latitude,
          position.coords.longitude
        ];

        setUserLocation(location);

        map.flyTo(location, 16);

      },

      () => {
        alert(
          "Could not get your location. Please allow location access."
        );
      }
    );
  };


  return (
    <button
      className="location-button"
      onClick={findLocation}
    >
      📍 Use My Location
    </button>
  );
}


function Map() {

  const [userLocation, setUserLocation] =
    useState(null);


  return (
    <main className="map-page">

      <div className="map-header">

        <div>

          <span>CS TECH STORE</span>

          <h1>
            Store Location
          </h1>

          <p>
            Find our store location on the live map.
          </p>

        </div>

      </div>


      <div className="map-wrapper">

        <MapContainer
          center={STORE_LOCATION}
          zoom={15}
          scrollWheelZoom={true}
          className="live-map"
        >

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />


          {/* Store */}

          <Marker position={STORE_LOCATION}>

            <Popup>

              <strong>
                🛒 CS Tech Store
              </strong>

              <br />

              Our store location

            </Popup>

          </Marker>


          {/* User location */}

          {userLocation && (

            <Marker position={userLocation}>

              <Popup>

                📍
                <strong>
                  You are here
                </strong>

              </Popup>

            </Marker>

          )}


          <LocateMe
            setUserLocation={setUserLocation}
          />

        </MapContainer>

      </div>


      <div className="map-info">

        <div>
          📍
          <strong>
            Store Location
          </strong>
          <p>
            Songkhla, Thailand
          </p>
        </div>


        <div>
          🗺️
          <strong>
            Interactive Map
          </strong>
          <p>
            Drag, zoom and explore the map.
          </p>
        </div>


        <div>
          📱
          <strong>
            Your Location
          </strong>
          <p>
            Use GPS to find your location.
          </p>
        </div>

      </div>

    </main>
  );
}

export default Map;