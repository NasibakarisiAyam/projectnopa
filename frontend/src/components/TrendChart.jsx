import React, { useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const TrendChart = ({ bookings = [] }) => {
    // aggregate bookings by date (day of month)
    const data = useMemo(() => {
        const counts = {};
        bookings.forEach(b => {
            const d = new Date(b.date).toLocaleDateString('id-ID');
            counts[d] = (counts[d] || 0) + 1;
        });

        const labels = Object.keys(counts).sort((a,b)=> new Date(a)-new Date(b));
        const values = labels.map(l => counts[l]);

        return {
            labels,
            datasets: [
                {
                    label: 'Bookings',
                    data: values,
                    backgroundColor: 'rgba(255,111,181,0.9)',
                }
            ]
        };
    }, [bookings]);

    const options = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: true, text: 'Tren Booking (per Tanggal)' }
        }
    };

    return (
        <div className="card p-4 mt-6">
            <div className="text-sm font-semibold text-gray-800 mb-2">Tren Booking (per Tanggal)</div>
            <Bar options={options} data={data} />
        </div>
    );
};

export default TrendChart;
