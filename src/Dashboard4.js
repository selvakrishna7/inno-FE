import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function Dashboard4({ ownerId, timeRange }) {
  const [currentData, setCurrentData] = useState([]);
  const [frequencyData, setFrequencyData] = useState([]);

  const isMinuteRange = timeRange === "m";

  const formatTooltip = (value, name) => [`${parseFloat(value).toFixed(6)}`, name];

  // Current Data Fetch
  useEffect(() => {
    if (!ownerId || !timeRange) return;

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/get_current_stats/?owner=${ownerId}&range=${timeRange}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMinuteRange) {
          const minuteMap = {};
          data.data.forEach((entry) => {
            const minute = parseInt(entry.time.split(":")[1], 10);
            if (!(minute in minuteMap)) {
              minuteMap[minute] = {
                time: minute.toString(),
                a1: entry.a1,
                a2: entry.a2,
                a3: entry.a3,
              };
            }
          });

          const fixedLabels = Array.from({ length: 60 }, (_, i) => (i + 1).toString());
          const aligned = fixedLabels.map((label) => minuteMap[parseInt(label)] ?? {
            time: label,
            a1: 0,
            a2: 0,
            a3: 0,
          });

          setCurrentData(aligned);
        } else {
          const formatted = data.data.map((entry) => ({
            time: entry.time,
            a1: entry.a1,
            a2: entry.a2,
            a3: entry.a3,
          }));
          setCurrentData(formatted);
        }
      })
      .catch((err) => console.error("Error fetching current stats:", err));
  }, [ownerId, timeRange]);

  // Frequency Data Fetch
  useEffect(() => {
    if (!ownerId || !timeRange) return;

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/get_frequency_stats/?owner=${ownerId}&range=${timeRange}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMinuteRange) {
          const minuteMap = {};
          data.data.forEach((entry) => {
            const minute = parseInt(entry.time.split(":")[1], 10);
            if (!(minute in minuteMap)) {
              minuteMap[minute] = {
                time: minute.toString(),
                frequency: parseFloat(entry.frequency.toFixed(6)),
              };
            }
          });

          const fixedLabels = Array.from({ length: 60 }, (_, i) => (i + 1).toString());
          const aligned = fixedLabels.map((label) => minuteMap[parseInt(label)] ?? {
            time: label,
            frequency: 0,
          });

          setFrequencyData(aligned);
        } else {
          const formatted = data.data.map((entry) => ({
            time: entry.time,
            frequency: parseFloat(entry.frequency.toFixed(6)),
          }));
          setFrequencyData(formatted);
        }
      })
      .catch((err) => console.error("Error fetching frequency stats:", err));
  }, [ownerId, timeRange]);

  return (
    <div className="graph-row" style={{ display: "flex", gap: "2rem" }}>
      {/* Current Chart */}
      <div className="graph-card" style={{ width: "50%" }}>
        <h2 className="text-xl font-semibold mb-2">🔋 Current Over Time (A)</h2>
        {currentData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            {isMinuteRange ? (
              <LineChart data={currentData}>
                <XAxis dataKey="time" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                <Line type="monotone" dataKey="a1" stroke="#e91e63" name="A1" />
                <Line type="monotone" dataKey="a2" stroke="#00bcd4" name="A2" />
                <Line type="monotone" dataKey="a3" stroke="#ffc107" name="A3" />
              </LineChart>
            ) : (
              <BarChart data={currentData}>
                <XAxis dataKey="time" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                <Bar dataKey="a1" fill="#e91e63" name="A1" />
                <Bar dataKey="a2" fill="#00bcd4" name="A2" />
                <Bar dataKey="a3" fill="#ffc107" name="A3" />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <p>Loading current data...</p>
        )}
      </div>

      {/* Frequency Chart */}
      <div className="graph-card" style={{ width: "50%" }}>
        <h2 className="text-xl font-semibold mb-2">⏱ Frequency Over Time (Hz)</h2>
        {frequencyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            {isMinuteRange ? (
              <LineChart data={frequencyData}>
                <XAxis dataKey="time" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                <Line type="monotone" dataKey="frequency" stroke="#9c27b0" name="Frequency" />
              </LineChart>
            ) : (
              <BarChart data={frequencyData}>
                <XAxis dataKey="time" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                <Bar dataKey="frequency" fill="#9c27b0" name="Frequency" />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <p>Loading frequency data...</p>
        )}
      </div>
    </div>
  );
}
