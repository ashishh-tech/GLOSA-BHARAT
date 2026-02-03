import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

// Import CSS
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet icon not appearing in React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icons
const junctionIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const vehicleIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: markerShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

// Component to handle map view updates with smooth transitions
const RecenterMap = ({ center }) => {
    const map = useMap();
    const [isUserInteracting, setIsUserInteracting] = useState(false);

    useEffect(() => {
        const resetInteraction = () => setIsUserInteracting(false);
        const handleInteraction = () => {
            setIsUserInteracting(true);
            // Resume auto-recenter after 10 seconds of inactivity
            clearTimeout(window.recenterTimeout);
            window.recenterTimeout = setTimeout(resetInteraction, 10000);
        };

        map.on('movestart', (e) => {
            if (e.originalEvent) handleInteraction();
        });

        return () => {
            map.off('movestart');
            clearTimeout(window.recenterTimeout);
        };
    }, [map]);

    useEffect(() => {
        if (center && !isUserInteracting) {
            map.flyTo(center, 15, {
                duration: 1.5,
                easeLinearity: 0.25
            });
        }
    }, [center, map, isUserInteracting]);

    return null;
};

const MapComponent = ({
    junction,
    vehiclePosition,
    distance,
    signalStatus,
    routePath = [], // Array of [lat, lng]
    routeJunctions = [], // Array of {lat, lng, status, name}
    start = null, // {lat, lng, name}
    destination = null // {lat, lng, name}
}) => {
    // Delhi Coordinates
    const defaultCenter = [28.6140, 77.2185];
    const junctionPos = junction ? [junction.lat, junction.lng] : defaultCenter;
    const vehiclePos = vehiclePosition ? [vehiclePosition.lat, vehiclePosition.lng] : junctionPos;

    const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

    useEffect(() => {
        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Create colored icons for route junctions
    const getSignalIcon = (status) => {
        const color = status === 'GREEN' ? 'green' : status === 'RED' ? 'red' : 'gold';
        return new L.Icon({
            iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
            shadowUrl: markerShadow,
            iconSize: [20, 32],
            iconAnchor: [10, 32],
            popupAnchor: [1, -34],
            shadowSize: [32, 32]
        });
    };

    // Custom Icons for Start and Destination
    const greenMarker = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });

    const redMarker = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: markerShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41]
    });

    return (
        <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
            <MapContainer
                center={start ? [start.lat, start.lng] : vehiclePos}
                zoom={14}
                style={{
                    height: '100%',
                    width: '100%',
                    zIndex: 1,
                    filter: isDarkMode ? 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' : 'none'
                }}
                zoomControl={false}
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />

                <RecenterMap center={start ? [start.lat, start.lng] : vehiclePos} />

                {/* Main Junction Marker (if selected) */}
                {junction && (
                    <Marker position={junctionPos} icon={junctionIcon}>
                        <Popup>
                            <div className="font-bold">Intersection: {junction?.name || "Target"}</div>
                        </Popup>
                    </Marker>
                )}

                {/* Route Path Polyline */}
                {routePath.length > 0 && (
                    <Polyline
                        positions={routePath}
                        color={isDarkMode ? "#38bdf8" : "#000080"}
                        weight={5}
                        opacity={0.7}
                    />
                )}

                {/* Start Marker */}
                {start && (
                    <Marker position={[start.lat, start.lng]} icon={greenMarker}>
                        <Popup>
                            <div className="font-bold text-xs uppercase text-green-600">Start Point</div>
                            <div className="text-[10px] font-bold">{start.name}</div>
                        </Popup>
                    </Marker>
                )}

                {/* Signal Markers along the route */}
                {routeJunctions.map((rj, idx) => (
                    <Marker key={idx} position={[rj.lat, rj.lng]} icon={getSignalIcon(rj.status)}>
                        <Popup>
                            <div className="text-xs">
                                <p className="font-bold uppercase tracking-tight">{rj.name}</p>
                                <p className={`font-black ${rj.status === 'GREEN' ? 'text-green-600' : rj.status === 'RED' ? 'text-red-600' : 'text-amber-500'}`}>
                                    SIGNAL: {rj.status}
                                </p>
                            </div>
                        </Popup>
                    </Marker>
                ))}

                {/* Current Vehicle Position */}
                <Marker position={vehiclePos} icon={vehicleIcon}>
                    <Popup>
                        <div className="font-bold text-xs uppercase">Your Live Position</div>
                        <div className="text-[10px] font-bold text-slate-500">TRANSMITTING TELEMETRY...</div>
                    </Popup>
                </Marker>

                {/* Destination Marker */}
                {destination && (
                    <Marker position={[destination.lat, destination.lng]} icon={redMarker}>
                        <Popup>
                            <div className="font-bold text-xs uppercase text-red-600">Goal Point</div>
                            <div className="text-[10px] font-bold">{destination.name}</div>
                        </Popup>
                    </Marker>
                )}

                {/* Proximity line (if no route but junction selected) */}
                {junction && routePath.length === 0 && (
                    <Polyline
                        positions={[vehiclePos, junctionPos]}
                        color="#000080"
                        weight={3}
                        dashArray="5, 10"
                    />
                )}
            </MapContainer>

            {/* Simple Overlay for Status */}
            {/* Overlay removed as requested */}

            {signalStatus && (
                <div className="absolute bottom-4 right-4 z-[1000]">
                    <div className={`px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-md border border-white/20 flex items-center gap-2 ${signalStatus === 'GREEN' ? 'bg-green-600/90 text-white' : signalStatus === 'RED' ? 'bg-red-600/90 text-white' : 'bg-amber-500/90 text-white'}`}>
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{signalStatus || "IDLE"}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapComponent;
