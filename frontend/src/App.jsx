import { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [courierName, setCourierName] = useState('SpeedX Logistics');
  const [message, setMessage] = useState('');
  const [trackingId, setTrackingId] = useState('');

  const bookDelivery = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/deliveries/book', {
        source, destination, courierName, cost: 150
      });
      setMessage(`Booking Confirmed! Tracking ID: ${res.data.data._id}`);
      setTrackingId(res.data.data._id);
      setSource('');
      setDestination('');
    } catch (error) {
      setMessage('Error processing booking. Check server connection.');
    }
  };

  const checkStatus = async () => {
    if (!trackingId) return;
    try {
      const res = await axios.get(`http://localhost:5000/api/deliveries/${trackingId}`);
      setMessage(`Status: ${res.data.status} | Route: ${res.data.source} to ${res.data.destination}`);
    } catch (error) {
      setMessage('Invalid Tracking ID or record not found.');
    }
  };

  const cancelDelivery = async () => {
    if (!trackingId) return;
    try {
      const res = await axios.put(`http://localhost:5000/api/deliveries/${trackingId}/cancel`);
      setMessage(`System Update: ${res.data.message}`);
    } catch (error) {
      setMessage('Error cancelling booking.');
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '600px', margin: 'auto' }}>
      <h2>P03: Delivery Agent System</h2>
      
      <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
        <h3>New Booking Request</h3>
        <form onSubmit={bookDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input placeholder="Shipping Source (e.g., Delhi)" value={source} onChange={e => setSource(e.target.value)} required style={{ padding: '10px' }}/>
          <input placeholder="Shipping Destination (e.g., Mumbai)" value={destination} onChange={e => setDestination(e.target.value)} required style={{ padding: '10px' }}/>
          <button type="submit" style={{ padding: '10px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Book Delivery</button>
        </form>
      </div>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h3>Manage Existing Services</h3>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
          <input placeholder="Enter System Tracking ID" value={trackingId} onChange={e => setTrackingId(e.target.value)} style={{ padding: '10px', flex: 1 }}/>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={checkStatus} style={{ padding: '10px', flex: 1, cursor: 'pointer' }}>Check Status</button>
          <button onClick={cancelDelivery} style={{ padding: '10px', flex: 1, background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '4px' }}>Cancel Booking</button>
        </div>
      </div>

      {message && (
        <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderLeft: '4px solid #007bff' }}>
          <strong>System Notice:</strong> {message}
        </div>
      )}
    </div>
  );
}
