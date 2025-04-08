import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Dashboard4({ ownerId, timeRange }) {
  const [currentData, setCurrentData] = useState([]);
  const [frequencyData, setFrequencyData] = useState([]);

  // Fetch Current Data
  useEffect(() => {
    if (!ownerId || !timeRange) return;

    fetch(`http://localhost:8000/api/get_current_stats/?owner=${ownerId}&range=${timeRange}`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.data.map((entry) => ({
          time: entry.time,
          a1: entry.a1,
          a2: entry.a2,
          a3: entry.a3,
        }));
        setCurrentData(formatted);
      })
      .catch((err) => console.error("Error fetching current stats:", err));
  }, [ownerId, timeRange]);

  // Fetch Frequency Data
  useEffect(() => {
    if (!ownerId || !timeRange) return;

    fetch(`http://localhost:8000/api/get_frequency_stats/?owner=${ownerId}&range=${timeRange}`)
      .then((res) => res.json())
      .then((data) => {
        const formatted = data.data.map((entry) => ({
          time: entry.time,
          frequency: entry.frequency,
        }));
        setFrequencyData(formatted);
      })
      .catch((err) => console.error("Error fetching frequency stats:", err));
  }, [ownerId, timeRange]);

  return (
    <div className="graph-row" style={{ display: "flex", gap: "2rem" }}>
      {/* Current Chart */}
      <div className="graph-card" style={{ width: "50%" }}>
        <h2 className="text-xl font-semibold mb-2">🔋 Current Over Time (A)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={currentData}>
            <XAxis dataKey="time" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="a1" stroke="#ff5252" name="A1" />
            <Line type="monotone" dataKey="a2" stroke="#4caf50" name="A2" />
            <Line type="monotone" dataKey="a3" stroke="#2196f3" name="A3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Frequency Chart */}
      <div className="graph-card" style={{ width: "50%" }}>
        <h2 className="text-xl font-semibold mb-2">⏱ Frequency Over Time (Hz)</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={frequencyData}>
            <XAxis dataKey="time" stroke="#fff" />
            <YAxis stroke="#fff" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="frequency" stroke="#ffa500" name="Frequency" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
