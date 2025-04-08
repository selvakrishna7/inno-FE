import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function Dashboard3({ ownerId, timeRange }) {
  const [voltageData, setVoltageData] = useState([]);
  const [powerFactorData, setPowerFactorData] = useState([]);

  // Fetch Voltage Data
  useEffect(() => {
    if (!ownerId || !timeRange) return;

    fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/get_voltage_stats/?owner=${ownerId}&range=${timeRange}`
    )
      .then((res) => res.json())
      .then((data) => {
        const transformed = data.data.map((entry) => ({
          time: entry.time,
          volt1: entry.volt1,
          volt2: entry.volt2,
          volt3: entry.volt3,
        }));
        setVoltageData(transformed);
      })
      .catch((err) => console.error("Error fetching voltage stats:", err));
  }, [ownerId, timeRange]);

  // Fetch Power Factor Data
  useEffect(() => {
    if (!ownerId || !timeRange) return;

    fetch(
      `${process.env.REACT_APP_BACKEND_URL}/api/get_power_factor/?owner=${ownerId}&range=${timeRange}`
    )
      .then((res) => res.json())
      .then((data) => {
        const pfData = data.data.map((entry) => ({
          time: entry.time,
          power_factor: entry.power_factor,
        }));
        setPowerFactorData(pfData);
      })
      .catch((err) => console.error("Error fetching power factor:", err));
  }, [ownerId, timeRange]);

  // Choose Chart type based on timeRange
  const isMinuteRange = timeRange === "m";

  return (
    <div
      className="graph-row"
      style={{
        display: "flex",
        flexDirection: "row",
        gap: "2rem",
        justifyContent: "center",
        alignItems: "flex-start",
      }}
    >
      {/* Voltage Chart */}
      <div className="graph-card" style={{ width: "600px" }}>
        <h2 className="text-xl font-semibold mb-2">🔌 Voltage Over Time</h2>
        {voltageData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            {isMinuteRange ? (
              <LineChart data={voltageData}>
                <XAxis dataKey="time" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="volt1" stroke="#ff5252" name="Volt 1" />
                <Line type="monotone" dataKey="volt2" stroke="#4caf50" name="Volt 2" />
                <Line type="monotone" dataKey="volt3" stroke="#2196f3" name="Volt 3" />
              </LineChart>
            ) : (
              <BarChart data={voltageData}>
                <XAxis dataKey="time" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Legend />
                <Bar dataKey="volt1" fill="#ff5252" name="Volt 1" />
                <Bar dataKey="volt2" fill="#4caf50" name="Volt 2" />
                <Bar dataKey="volt3" fill="#2196f3" name="Volt 3" />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <p>Loading voltage data...</p>
        )}
      </div>

      {/* Power Factor Chart */}
      <div className="graph-card" style={{ width: "600px" }}>
        <h2 className="text-xl font-semibold mb-2">⚡ Power Factor Over Time</h2>
        {powerFactorData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            {isMinuteRange ? (
              <LineChart data={powerFactorData}>
                <XAxis dataKey="time" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="power_factor"
                  stroke="#ff9800"
                  strokeWidth={2}
                  dot={true}
                  name="Power Factor"
                />
              </LineChart>
            ) : (
              <BarChart data={powerFactorData}>
                <XAxis dataKey="time" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="power_factor"
                  fill="#ff9800"
                  name="Power Factor"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        ) : (
          <p>Loading power factor data...</p>
        )}
      </div>
    </div>
  );
}
