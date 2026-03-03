import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';


try {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
} catch (error) {
    console.log('Leaflet icon setup error:', error);
}

function LocationMarker({ position, setPosition }) {
    useMapEvents({
        click(e) {
            setPosition({
                lat: e.latlng.lat,
                lng: e.latlng.lng
            });
        },
    });

    return position ? <Marker position={[position.lat, position.lng]} /> : null;
}

const LocationPicker = ({ onLocationSelect, initialPosition }) => {
    const [position, setPosition] = useState(initialPosition || null);
    const [center, setCenter] = useState([27.7172, 85.3240]); 
    const [mapError, setMapError] = useState(false);

    useEffect(() => {
        
        if (!initialPosition && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const newCenter = [pos.coords.latitude, pos.coords.longitude];
                    setCenter(newCenter);
                    
                    
                },
                (error) => {
                    console.log('Geolocation error:', error);
                    
                }
            );
        } else if (initialPosition) {
            setCenter([initialPosition.lat, initialPosition.lng]);
        }
    }, [initialPosition]);

    useEffect(() => {
        if (position && onLocationSelect) {
            onLocationSelect(position);
        }
    }, [position, onLocationSelect]);

    return (
        <div style={{ marginTop: '12px' }}>
            <div style={{ 
                height: '300px', 
                borderRadius: '12px', 
                overflow: 'hidden',
                border: '2px solid #e5e7eb'
            }}>
                {mapError ? (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: '#f3f4f6',
                        color: '#6b7280',
                        textAlign: 'center',
                        padding: '20px'
                    }}>
                        <div>
                            <p style={{ margin: 0, fontSize: '14px' }}>Map temporarily unavailable</p>
                            <p style={{ margin: '8px 0 0 0', fontSize: '12px' }}>You can still submit your report with the location description</p>
                        </div>
                    </div>
                ) : (
                    <MapContainer
                        center={center}
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <LocationMarker position={position} setPosition={setPosition} />
                    </MapContainer>
                )}
            </div>
            {position && (
                <div style={{
                    marginTop: '12px',
                    padding: '12px',
                    background: '#f3f4f6',
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: '#374151'
                }}>
                    <strong>Selected Location:</strong> {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
                </div>
            )}
            <p style={{
                marginTop: '8px',
                fontSize: '12px',
                color: '#6b7280'
            }}>
                Click on the map to select the exact location where you spotted the animal
            </p>
        </div>
    );
};

export default LocationPicker;
