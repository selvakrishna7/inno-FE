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

  const isMinuteRange = timeRange === "m";

  // Voltage Data Fetch
  useEffect(() => {
    if (!ownerId || !timeRange) return;

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/get_voltage_stats/?owner=${ownerId}&range=${timeRange}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMinuteRange) {
          const minuteMap = {};
          data.data.forEach((entry) => {
            const minute = parseInt(entry.time.split(":")[1], 10);
            if (!(minute in minuteMap)) {
              minuteMap[minute] = {
                time: minute.toString(),
                volt1: entry.volt1,
                volt2: entry.volt2,
                volt3: entry.volt3,
              };
            }
          });

          const fixedLabels = Array.from({ length: 60 }, (_, i) => (i + 1).toString());
          const aligned = fixedLabels.map((label) => minuteMap[parseInt(label)] ?? {
            time: label,
            volt1: 0,
            volt2: 0,
            volt3: 0,
          });

          setVoltageData(aligned);
        } else {
          const transformed = data.data.map((entry) => ({
            time: entry.time,
            volt1: entry.volt1,
            volt2: entry.volt2,
            volt3: entry.volt3,
          }));
          setVoltageData(transformed);
        }
      })
      .catch((err) => console.error("Error fetching voltage stats:", err));
  }, [ownerId, timeRange]);

  // Power Factor Data Fetch
  useEffect(() => {
    if (!ownerId || !timeRange) return;

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/get_power_factor/?owner=${ownerId}&range=${timeRange}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMinuteRange) {
          const minuteMap = {};
          data.data.forEach((entry) => {
            const minute = parseInt(entry.time.split(":")[1], 10);
            if (!(minute in minuteMap)) {
              minuteMap[minute] = {
                time: minute.toString(),
                power_factor: parseFloat(entry.power_factor.toFixed(6)),
              };
            }
          });

          const fixedLabels = Array.from({ length: 60 }, (_, i) => (i + 1).toString());
          const aligned = fixedLabels.map((label) => minuteMap[parseInt(label)] ?? {
            time: label,
            power_factor: 0,
          });

          setPowerFactorData(aligned);
        } else {
          const pfData = data.data.map((entry) => ({
            time: entry.time,
            power_factor: parseFloat(entry.power_factor.toFixed(6)),
          }));
          setPowerFactorData(pfData);
        }
      })
      .catch((err) => console.error("Error fetching power factor:", err));
  }, [ownerId, timeRange]);

  // Tooltip formatter for precision
  const formatTooltip = (value, name) => [`${parseFloat(value).toFixed(6)}`, name];

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
      {/* Voltage Graph */}
      <div className="graph-card" style={{ width: "600px" }}>
        <h2 className="text-xl font-semibold mb-2">🔌 Voltage Over Time</h2>
        {voltageData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            {isMinuteRange ? (
              <LineChart data={voltageData}>
                <XAxis dataKey="time" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip formatter={formatTooltip} />
                <Legend />
                <Line type="monotone" dataKey="volt1" stroke="#ff5252" name="Volt 1" />
                <Line type="monotone" dataKey="volt2" stroke="#4caf50" name="Volt 2" />
                <Line type="monotone" dataKey="volt3" stroke="#2196f3" name="Volt 3" />
              </LineChart>
            ) : (
              <BarChart data={voltageData}>
                <XAxis dataKey="time" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip formatter={formatTooltip} />
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

      {/* Power Factor Graph */}
      <div className="graph-card" style={{ width: "600px" }}>
        <h2 className="text-xl font-semibold mb-2">⚡ Power Factor Over Time</h2>
        {powerFactorData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            {isMinuteRange ? (
              <LineChart data={powerFactorData}>
                <XAxis dataKey="time" stroke="#fff" />
                <YAxis stroke="#fff" />
                <Tooltip formatter={formatTooltip} />
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
                <Tooltip formatter={formatTooltip} />
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
