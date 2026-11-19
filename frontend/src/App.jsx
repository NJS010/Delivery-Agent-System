import { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  const [couriers, setCouriers] = useState([]);
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedCourierId, setSelectedCourierId] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [message, setMessage] = useState('');
  
  const API_BASE = 'http://localhost:5000/api';

  // Fetch couriers on component mount
  useEffect(() => {
    const fetchCouriers = async () => {
      try {
        const res = await axios.get(`${API_BASE}/couriers`);
        setCouriers(res.data);
        if (res.data.length > 0) setSelectedCourierId(res.data[0]._id);
      } catch (error) {
        console.error("Error fetching couriers");
      }
    };
    fetchCouriers();
  }, []);

  const bookDelivery = async (e) => {
    e.preventDefault();
    try {
      const selectedCourier = couriers.find(c => c._id === selectedCourierId);
      const res = await axios.post(`${API_BASE}/deliveries/book`, { 
        source, 
        destination, 
        courierId: selectedCourierId, 
        cost: selectedCourier.basePrice 
      });
      setMessage(`Booking Confirmed! Tracking ID: ${res.data.data._id}`);
      setTrackingId(res.data.data._id);
    } catch (error) {
      setMessage('Error processing booking.');
    }
  };

  const checkStatus = async () => {
    try {
      const res = await axios.get(`${API_BASE}/deliveries/${trackingId}`);
      setMessage(`Status: ${res.data.status} | Route: ${res.data.source} to ${res.data.destination}`);
    } catch (error) {
      setMessage('Invalid Tracking ID.');
    }
  };

  const cancelDelivery = async () => {
    try {
      const res = await axios.put(`${API_BASE}/deliveries/${trackingId}/cancel`);
      setMessage(`Update: ${res.data.message}`);
    } catch (error) {
      setMessage('Error cancelling booking.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Delivery Logistics Engine</h1>
          <p className="text-gray-500 mt-1">P03 System Dashboard</p>
        </header>

        {message && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 text-blue-800 rounded shadow-sm">
            <span className="font-semibold">System Alert:</span> {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Booking Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Dispatch Request</h2>
            <form onSubmit={bookDelivery} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source City</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" value={source} onChange={e => setSource(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Destination City</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 outline-none" value={destination} onChange={e => setDestination(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign Courier</label>
                <select className="w-full border border-gray-300 rounded-md p-2.5 bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={selectedCourierId} onChange={e => setSelectedCourierId(e.target.value)}>
                  {couriers.map(c => (
                    <option key={c._id} value={c._id}>{c.name} (Base: ₹{c.basePrice})</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md transition-colors">
                Initialize Delivery
              </button>
            </form>
          </div>

          {/* Management Section */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Order Tracking</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Active Tracking ID</label>
                <input type="text" className="w-full border border-gray-300 rounded-md p-2.5 focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm" value={trackingId} onChange={e => setTrackingId(e.target.value)} placeholder="Paste MongoDB Object ID..." />
              </div>
              
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button onClick={checkStatus} className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 rounded-md transition-colors">
                  Poll Status
                </button>
                <button onClick={cancelDelivery} className="bg-red-50 hover:bg-red-100 text-red-600 font-medium py-2 rounded-md transition-colors border border-red-200">
                  Abort Booking
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
