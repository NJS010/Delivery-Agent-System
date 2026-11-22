import { useState } from 'react';
import { Truck, MapPin, IndianRupee } from 'lucide-react';
import KpiCard from './KpiCard';
import BookingForm from './BookingForm';
import OrderTracker from './OrderTracker';
import CourierNetworkTable from './CourierNetworkTable';

export default function CustomerPortal({ couriers, notify }) {
  const [trackedOrder, setTrackedOrder] = useState(null);

  const lowestRate = couriers.length ? Math.min(...couriers.map((c) => c.basePrice)) : 0;
  const totalCities = new Set(couriers.flatMap((c) => c.availableLocalities)).size;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <KpiCard label="Active Partners" value={couriers.length} icon={Truck} iconBg="bg-blue-50 text-blue-600" />
        <KpiCard label="Starting Rate" value={`₹${lowestRate}`} icon={IndianRupee} iconBg="bg-emerald-50 text-emerald-600" />
        <KpiCard label="Serviceable Cities" value={totalCities} icon={MapPin} iconBg="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <BookingForm couriers={couriers} onBooked={setTrackedOrder} notify={notify} />
        <OrderTracker trackedOrder={trackedOrder} setTrackedOrder={setTrackedOrder} notify={notify} />
      </div>

      <CourierNetworkTable couriers={couriers} />
    </div>
  );
}