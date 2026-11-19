import { useState, useEffect } from 'react';
import axios from 'axios';

export default function App() {
  // Common State
  const [couriers, setCouriers] = useState([]);
  const [message, setMessage] = useState('');
  
  // Customer State
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [selectedCourierId, setSelectedCourierId] = useState('');
  const [trackingId, setTrackingId] = useState('');
  
  // Admin Auth State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token, setToken] = useState(localStorage.getItem('adminToken') || '');
  const [history, setHistory] = useState(null);
  
  const API_BASE = 'http://localhost:5000/api';

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

  // --- AUTH FUNCTIONS ---
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/auth/login`, { username, password });
      setToken(res.data.token);
      localStorage.setItem('adminToken', res.data.token);
      setMessage('Admin logged in successfully.');
      setUsername('');
      setPassword('');
    } catch (error) {
      setMessage('Invalid credentials.');
    }
  };

  const handleLogout = () => {
    setToken('');
    localStorage.removeItem('adminToken');
    setHistory(null);
    setMessage('Logged out.');
  };

  // Helper function for admin API calls
  const authConfig = { headers: { Authorization: `Bearer ${token}` } };

  // --- CUSTOMER FUNCTIONS (Unprotected) ---
  const bookDelivery = async (e) => {
    e.preventDefault();
    try {
      const selectedCourier = couriers.find(c => c._id === selectedCourierId);
      const res = await axios.post(`${API_BASE}/deliveries/book`, { 
        source, destination, courierId: selectedCourierId, cost: selectedCourier.basePrice 
      });
      setMessage(`Booking Confirmed! ID: ${res.data.data._id}`);
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

  // --- ADMIN FUNCTIONS (Protected) ---
  const completeDelivery = async (onTime) => {
    try {
      const res = await axios.put(`${API_BASE}/deliveries/${trackingId}/complete`, { onTime }, authConfig);
      setMessage(res.data.message);
    } catch (error) {
      setMessage('Error updating status. Are you logged in?');
    }
  };

  const archiveRecord = async () => {
    try {
      const res = await axios.put(`${API_BASE}/deliveries/${trackingId}/archive`, {}, authConfig);
      setMessage('Record successfully moved to archives.');
    } catch (error) {
      setMessage('Error archiving record.');
    }
  };

  const fetchCourierHistory = async () => {
    const courier = couriers.find(c => c._id === selectedCourierId);
    if (!courier) return;
    try {
      const res = await axios.get(`${API_BASE}/deliveries/courier/${courier.name}/history`, authConfig);
      setHistory(res.data);
      setMessage(`Fetched history for ${courier.name}`);
    } catch (error) {
      setMessage('Session expired or access denied.');
      handleLogout();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="mb-8 border-b pb-4 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Delivery Logistics Engine</h1>
            <p className="text-gray-500 mt-1">CS311 Project P03</p>
          </div>
          {token && (
            <button onClick={handleLogout} className="bg-red-50 text-red-600 px-4 py-2 rounded-md font-medium border border-red-200">
              Logout Admin
            </button>
          )}
        </header>

        {message && (
          <div className="mb-6 p-4 bg-blue-50 border-l-4 border-blue-600 text-blue-800 rounded shadow-sm">
            <span className="font-semibold">System:</span> {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* LEFT COLUMN: Customer Portal */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">1. Dispatch Request</h2>
              <form onSubmit={bookDelivery} className="space-y-4">
                <input type="text" placeholder="Source City" className="w-full border p-2.5 rounded-md outline-none focus:ring-2 focus:ring-blue-500" value={source} onChange={e => setSource(e.target.value)} required />
                <input type="text" placeholder="Destination City" className="w-full border p-2.5 rounded-md outline-none focus:ring-2 focus:ring-blue-500" value={destination} onChange={e => setDestination(e.target.value)} required />
                <select className="w-full border p-2.5 rounded-md outline-none focus:ring-2 focus:ring-blue-500" value={selectedCourierId} onChange={e => setSelectedCourierId(e.target.value)}>
                  {couriers.map(c => <option key={c._id} value={c._id}>{c.name} (Base: ₹{c.basePrice})</option>)}
                </select>
                <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-md">Book Delivery</button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">2. Manage Booking</h2>
              <input type="text" className="w-full border p-2.5 mb-3 rounded-md outline-none font-mono text-sm" value={trackingId} onChange={e => setTrackingId(e.target.value)} placeholder="Enter Tracking ID..." />
              <div className="flex gap-2">
                <button onClick={checkStatus} className="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded-md font-medium text-sm">Status</button>
                <button onClick={cancelDelivery} className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-md font-medium text-sm">Cancel</button>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Admin Portal / Login */}
          <div className="space-y-6">
            {!token ? (
              // Login View
              <div className="bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-700 text-white h-full flex flex-col justify-center">
                <h2 className="text-xl font-semibold mb-2">Restricted Area</h2>
                <p className="text-slate-400 text-sm mb-6">Staff authentication required to access logistics controls.</p>
                <form onSubmit={handleLogin} className="space-y-4">
                  <input type="text" placeholder="Admin Username" className="w-full bg-slate-700 border-none p-2.5 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-white" value={username} onChange={e => setUsername(e.target.value)} required />
                  <input type="password" placeholder="Password" className="w-full bg-slate-700 border-none p-2.5 rounded-md outline-none focus:ring-2 focus:ring-blue-500 text-white" value={password} onChange={e => setPassword(e.target.value)} required />
                  <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 font-medium py-2.5 rounded-md transition-colors">Authenticate</button>
                </form>
              </div>
            ) : (
              // Authenticated Admin View
              <>
                <div className="bg-slate-800 p-6 rounded-lg shadow-sm border border-slate-700 text-white">
                  <h2 className="text-xl font-semibold mb-1">3. Agent Controls</h2>
                  <p className="text-slate-400 text-xs mb-4">Requires active Tracking ID from Section 2</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button onClick={() => completeDelivery(true)} className="bg-emerald-600 hover:bg-emerald-500 py-2.5 rounded-md text-sm font-medium transition-colors">Deliver (On-Time)</button>
                    <button onClick={() => completeDelivery(false)} className="bg-amber-500 hover:bg-amber-400 text-slate-900 py-2.5 rounded-md text-sm font-medium transition-colors">Deliver (Late)</button>
                    <button onClick={archiveRecord} className="bg-slate-600 hover:bg-slate-500 py-2.5 rounded-md text-sm font-medium transition-colors">Archive Record</button>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">4. Logistics Analytics</h2>
                  <select className="w-full border p-2.5 rounded-md bg-white mb-3" value={selectedCourierId} onChange={e => setSelectedCourierId(e.target.value)}>
                    {couriers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  <button onClick={fetchCourierHistory} className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-medium py-2.5 rounded-md">Generate Report</button>
                  
                  {history && (
                    <div className="mt-4 p-4 bg-gray-50 border rounded text-sm">
                      <p className="mb-1"><span className="font-semibold text-gray-700">Courier:</span> {history.courier}</p>
                      <p className="mb-1"><span className="font-semibold text-gray-700">Total Deliveries:</span> {history.totalDeliveries}</p>
                      <p><span className="font-semibold text-gray-700">Net Rewards/Penalties:</span> ₹{history.netRewards}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
