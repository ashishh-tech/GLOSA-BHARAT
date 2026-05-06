import React, { useState, useEffect, useRef } from 'react';
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

// ── Fix tile seam/split by calling invalidateSize after mount & filter changes ──
const MapResizer = ({ isDarkMode }) => {
    const map = useMap();

    useEffect(() => {
        // Give Leaflet time to render then recalculate tile grid
        const t = setTimeout(() => {
            map.invalidateSize({ animate: false });
        }, 200);
        return () => clearTimeout(t);
    }, [map, isDarkMode]);

    return null;
};

const RecenterMap = ({ center }) => {
    const map = useMap();
    const prevCenterRef = useRef(center);

    useEffect(() => {
        const centerChanged = prevCenterRef.current &&
            (prevCenterRef.current[0] !== center[0] || prevCenterRef.current[1] !== center[1]);

        if (centerChanged) {
            map.flyTo(center, 14, {
                duration: 1.8,
                easeLinearity: 0.25
            });
        }
        prevCenterRef.current = center;
    }, [center, map]);

    return null;
};

const MapComponent = ({
    junction,
    vehiclePosition,
    distance,
    signalStatus,
    routePath = [],
    routeJunctions = [],
    start = null,
    destination = null,
    initialCenter = null,  // override starting map centre (e.g. centre of India)
    initialZoom = 14       // override starting zoom level
}) => {
    const defaultCenter = [28.6140, 77.2185]; // India Gate, New Delhi
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

    // Only draw the proximity dashed line if the junction is within ~3km of the vehicle
    // (avoids the wild diagonal line shooting across the entire map)
    const proximityDistanceMeters = distance || 0;
    const showProximityLine = junction && routePath.length === 0 && proximityDistanceMeters < 3000;

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

    const mapCenter = initialCenter
        ? initialCenter                                   // caller-supplied (e.g. India overview)
        : start ? [start.lat, start.lng]                  // route start
            : vehiclePos;                                     // vehicle / default

    return (
        <div
            className="relative w-full h-full min-h-[450px] rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-lg bg-slate-50 dark:bg-slate-900 transition-colors duration-300 isolate"
            style={{ contain: 'strict' }}
        >
            <MapContainer
                center={mapCenter}
                zoom={initialZoom}
                minZoom={4}
                maxZoom={18}
                maxBounds={[
                    [6.0, 68.0],
                    [37.6, 98.0]
                ]}
                maxBoundsViscosity={1.0}
                wheelPxPerZoomLevel={100}
                style={{
                    height: '100%',
                    width: '100%',
                    zIndex: 1,
                    filter: isDarkMode
                        ? 'brightness(0.7) contrast(1.1) saturate(0.8) hue-rotate(180deg) invert(1)'
                        : 'none',
                    transition: 'filter 0.4s ease'
                }}
                zoomControl={true}
            >
                {/* Fix tile seam on tab switches and dark-mode toggling */}
                <MapResizer isDarkMode={isDarkMode} />

                <TileLayer
                    url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                    subdomains={['mt0', 'mt1', 'mt2', 'mt3']}
                    attribution='&copy; Google Maps'
                    maxZoom={20}
                    keepBuffer={4}
                />

                <RecenterMap center={mapCenter} />

                {/* Main Junction Marker */}
                {junction && (
                    <Marker position={junctionPos} icon={junctionIcon}>
                        <Popup>
                            <div className="font-bold">Signal: {junction?.name || "Target Junction"}</div>
                        </Popup>
                    </Marker>
                )}

                {/* Route Path Polyline */}
                {routePath.length > 0 && (
                    <Polyline
                        positions={routePath}
                        color={isDarkMode ? "#38bdf8" : "#000080"}
                        weight={5}
                        opacity={0.75}
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

                {/* Vehicle Position */}
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

                {/* Proximity dashed line ONLY if junction is nearby (< 3km) */}
                {showProximityLine && (
                    <Polyline
                        positions={[vehiclePos, junctionPos]}
                        color="#f59e0b"
                        weight={2}
                        dashArray="6, 10"
                        opacity={0.7}
                    />
                )}
            </MapContainer>

            {/* Signal Status Badge */}
            {signalStatus && signalStatus !== 'IDLE' && signalStatus !== 'ROUTING' && (
                <div className="absolute bottom-4 right-4 z-[1000]">
                    <div className={`px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-md border border-white/20 flex items-center gap-2 ${signalStatus === 'GREEN' ? 'bg-green-600/90 text-white' :
                        signalStatus === 'RED' ? 'bg-red-600/90 text-white' :
                            'bg-amber-500/90 text-white'
                        }`}>
                        <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{signalStatus}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MapComponent;
