import { useState } from 'react';
import axios from 'axios';

export default function App() {
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [courierName, setCourierName] = useState('SpeedX Logistics');
  const [trackingId, setTrackingId] = useState('');
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState(null);

  const API_BASE = 'http://localhost:5000/api/deliveries';

  // --- CUSTOMER FUNCTIONS ---
  const bookDelivery = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/book`, { source, destination, courierName, cost: 150 });
      setMessage(`Booking Confirmed! Tracking ID: ${res.data.data._id}`);
      setTrackingId(res.data.data._id);
    } catch (error) {
      setMessage('Error processing booking.');
    }
  };

  const checkStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/${trackingId}`);
      setMessage(`Status: ${res.data.status} | Route: ${res.data.source} to ${res.data.destination}`);
    } catch (error) {
      setMessage('Invalid Tracking ID.');
    }
  };

  const cancelDelivery = async () => {
    try {
      const res = await axios.put(`${API_BASE}/${trackingId}/cancel`);
      setMessage(`Update: ${res.data.message}`);
    } catch (error) {
      setMessage('Error cancelling booking.');
    }
  };

  const rescheduleDelivery = async () => {
    const newDest = prompt("Enter new destination:");
    if (!newDest) return;
    try {
      const res = await axios.put(`${API_BASE}/${trackingId}/reschedule`, { newDestination: newDest });
      setMessage(`Rescheduled! New destination: ${res.data.data.destination}`);
    } catch (error) {
      setMessage('Error rescheduling.');
    }
  };

  // --- ADMIN / COURIER FUNCTIONS ---
  const completeDelivery = async (onTime) => {
    try {
      const res = await axios.put(`${API_BASE}/${trackingId}/complete`, { onTime });
      setMessage(res.data.message);
    } catch (error) {
      setMessage('Error updating delivery status.');
    }
  };

  const archiveRecord = async () => {
    try {
      const res = await axios.put(`${API_BASE}/${trackingId}/archive`);
      setMessage('Record successfully moved to archives.');
    } catch (error) {
      setMessage('Error archiving record.');
    }
  };

  const fetchCourierHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/courier/${courierName}/history`);
      setHistory(res.data);
      setMessage(`Fetched history for ${courierName}`);
    } catch (error) {
      setMessage('Error fetching history.');
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui', maxWidth: '800px', margin: 'auto' }}>
      <h2>P03: Delivery Agent System (Full Build)</h2>
      
      {message && (
        <div style={{ marginBottom: '20px', padding: '15px', background: '#d4edda', color: '#155724', borderRadius: '4px' }}>
          <strong>System:</strong> {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        
        {/* LEFT COLUMN: Booking & Status */}
        <div>
          <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '8px' }}>
            <h3>1. Book a Delivery</h3>
            <form onSubmit={bookDelivery} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input placeholder="Source" value={source} onChange={e => setSource(e.target.value)} required style={{ padding: '8px' }}/>
              <input placeholder="Destination" value={destination} onChange={e => setDestination(e.target.value)} required style={{ padding: '8px' }}/>
              <button type="submit" style={{ padding: '8px', background: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}>Book Now</button>
            </form>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
            <h3>2. Customer Portal</h3>
            <input placeholder="Enter Tracking ID" value={trackingId} onChange={e => setTrackingId(e.target.value)} style={{ padding: '8px', width: '95%', marginBottom: '10px' }}/>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              <button onClick={checkStatus} style={{ padding: '8px', cursor: 'pointer' }}>Status</button>
              <button onClick={rescheduleDelivery} style={{ padding: '8px', cursor: 'pointer' }}>Reschedule</button>
              <button onClick={cancelDelivery} style={{ padding: '8px', background: '#dc3545', color: 'white', border: 'none', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Admin & Logistics */}
        <div>
          <div style={{ border: '1px solid #ccc', padding: '20px', marginBottom: '20px', borderRadius: '8px', background: '#f8f9fa' }}>
            <h3>3. Admin / Agent Portal</h3>
            <p style={{ fontSize: '12px', color: '#666' }}>Requires Tracking ID from Section 2</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
              <button onClick={() => completeDelivery(true)} style={{ padding: '8px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer' }}>Deliver On-Time (Reward)</button>
              <button onClick={() => completeDelivery(false)} style={{ padding: '8px', background: '#ffc107', border: 'none', cursor: 'pointer' }}>Deliver Late (Penalty)</button>
              <button onClick={archiveRecord} style={{ padding: '8px', background: '#6c757d', color: 'white', border: 'none', cursor: 'pointer' }}>Archive Record</button>
            </div>
          </div>

          <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', background: '#f8f9fa' }}>
            <h3>4. Courier Analytics</h3>
            <input value={courierName} onChange={e => setCourierName(e.target.value)} style={{ padding: '8px', width: '95%', marginBottom: '10px' }}/>
            <button onClick={fetchCourierHistory} style={{ padding: '8px', width: '100%', cursor: 'pointer' }}>Generate Report</button>
            
            {history && (
              <div style={{ marginTop: '15px', fontSize: '14px' }}>
                <p><strong>Total Deliveries:</strong> {history.totalDeliveries}</p>
                <p><strong>Net Reward/Penalty:</strong> ₹{history.netRewards}</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
