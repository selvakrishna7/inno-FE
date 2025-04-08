import React, { useState, useEffect } from "react";
import MyChartComponent from "./MyChartComponent";

export default function Dashboard2({ ownerId, timeRange }) {
  const [energyData, setEnergyData] = useState(null);
  const [ghgData, setGhgData] = useState(null);

  // Fetch Energy Consumption Stats
  useEffect(() => {
    if (!ownerId || !timeRange) return;
  
    fetch(`http://localhost:8000/api/get_energy_consumption/?owner=${ownerId}&range=${timeRange}`)
      .then((res) => res.json())
      .then((data) => {
        const timeLabels = data.data.map((entry) => entry.time);
        const energyConsumed = data.data.map((entry) => entry.energy_diff); // <- updated key
  
        setEnergyData({
          labels: timeLabels,
          datasets: [
            {
              label: "Energy Consumed (kWh)",
              data: energyConsumed,
              borderColor: "#0288d1",
              backgroundColor: "rgba(2, 136, 209, 0.3)",
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

    fetch(`http://localhost:8000/api/get_ghg_emission/?owner=${ownerId}&range=${timeRange}`)
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
              data: ghg,
              borderColor: "#6a1b9a",
              backgroundColor: "rgba(106, 27, 154, 0.3)",
              fill: true,
              tension: 0.4,
            },
            {
              label: "Energy Used (kWh)",
              data: energy,
              borderColor: "#ff8f00",
              backgroundColor: "rgba(255, 143, 0, 0.3)",
              fill: true,
              tension: 0.4,
            },
          ],
        });
      })
      .catch((err) => console.error("Error fetching GHG emissions:", err));
  }, [ownerId, timeRange]);

  const energyOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `Energy Consumption Over Time (Owner ${ownerId})`,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Energy (kWh)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
    },
  };

  const ghgOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
      title: {
        display: true,
        text: `GHG Emissions & Energy Usage (Owner ${ownerId})`,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: "Values (g / kWh)",
        },
      },
      x: {
        title: {
          display: true,
          text: "Time",
        },
      },
    },
  };

  return (
    <div style={{ display: 'flex' }}>
      {!energyData ? (
        <p>Loading energy consumption chart...</p>
      ) : (
        <div style={{ width: "800px", height: "400px", marginBottom: "2rem" }}>
          <MyChartComponent chartData={energyData} chartOptions={energyOptions} />
        </div>
      )}

      {!ghgData ? (
        <p>Loading GHG emissions chart...</p>
      ) : (
        <div style={{ width: "800px", height: "400px", marginBottom: "2rem" }}>
          <MyChartComponent chartData={ghgData} chartOptions={ghgOptions} />
        </div>
      )}
    </div>
  );
}
