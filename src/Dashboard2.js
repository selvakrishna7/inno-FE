import React, { useState, useEffect } from "react";
import MyChartComponent from "./MyChartComponent";

export default function Dashboard2({ ownerId, timeRange }) {
  const [energyData, setEnergyData] = useState(null);
  const [ghgData, setGhgData] = useState(null);

  const DARK_ORANGE = "#ff6f00";
  const DARK_ORANGE_BG = "rgba(255, 111, 0, 0.3)";

  const isMinuteRange = timeRange === "m";
  const chartType = isMinuteRange ? "line" : "bar";

  // Fetch Energy Consumption Stats
  useEffect(() => {
    if (!ownerId || !timeRange) return;

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/get_energy_consumption/?owner=${ownerId}&range=${timeRange}`)
      .then((res) => res.json())
      .then((data) => {
        const timeLabels = data.data.map((entry) => entry.time);
        const energyConsumed = data.data.map((entry) => entry.energy_diff);

        setEnergyData({
          labels: timeLabels,
          datasets: [
            {
              label: "Energy Consumed (kWh)",
              type: chartType,
              data: energyConsumed,
              borderColor: DARK_ORANGE,
              backgroundColor: DARK_ORANGE_BG,
              fill: true,
              tension: 0.4,
            },
          ],
        });
      })
      .catch((err) => console.error("Error fetching energy consumption:", err));
  }, [ownerId, timeRange]);

  // Fetch GHG Emissions
  useEffect(() => {
    if (!ownerId || !timeRange) return;

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/get_ghg_emission/?owner=${ownerId}&range=${timeRange}`)
      .then((res) => res.json())
      .then((data) => {
        const timeLabels = data.data.map((entry) => entry.time);
        const ghg = data.data.map((entry) => entry.ghg_emission);
        const energy = data.data.map((entry) => entry.energy_diff);

        setGhgData({
          labels: timeLabels,
          datasets: [
            {
              label: "GHG Emission (g)",
              type: chartType,
              data: ghg,
              borderColor: DARK_ORANGE,
              backgroundColor: DARK_ORANGE_BG,
              fill: true,
              tension: 0.4,
            },
            {
              label: "Energy Used (kWh)",
              type: chartType,
              data: energy,
              borderColor: DARK_ORANGE,
              backgroundColor: DARK_ORANGE_BG,
              fill: true,
              tension: 0.4,
            },
          ],
        });
      })
      .catch((err) => console.error("Error fetching GHG emissions:", err));
  }, [ownerId, timeRange]);

  const chartBaseOptions = (titleText, yLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: titleText,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: yLabel,
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
    },
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {!energyData ? (
        <p>Loading energy consumption chart...</p>
      ) : (
        <div style={{ width: "800px", height: "400px", marginBottom: "2rem" }}>
          <MyChartComponent
            chartData={energyData}
            chartOptions={chartBaseOptions(
              `Energy Consumption Over Time (Owner ${ownerId})`,
              "Energy (kWh)"
            )}
          />
        </div>
      )}

      {!ghgData ? (
        <p>Loading GHG emissions chart...</p>
      ) : (
        <div style={{ width: "800px", height: "400px", marginBottom: "2rem" }}>
          <MyChartComponent
            chartData={ghgData}
            chartOptions={chartBaseOptions(
              `GHG Emissions & Energy Usage (Owner ${ownerId})`,
              "Values (g / kWh)"
            )}
          />
        </div>
      )}
    </div>
  );
}
