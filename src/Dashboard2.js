import React, { useState, useEffect } from "react";
import MyChartComponent from "./MyChartComponent";

export default function Dashboard2({ ownerId, timeRange }) {
  const [energyData, setEnergyData] = useState(null);
  const [ghgData, setGhgData] = useState(null);

  const DARK_ORANGE = "#ff6f00";
  const DARK_ORANGE_BG = "rgba(255, 111, 0, 0.3)";
  const chartType = timeRange === "m" ? "line" : "bar";

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const getFixedLabels = () => {
    if (timeRange === "m") return Array.from({ length: 60 }, (_, i) => (i + 1).toString());
    if (timeRange === "h") return Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"));
    if (timeRange === "d") return Array.from({ length: 31 }, (_, i) => (i + 1).toString().padStart(2, "0"));
    if (timeRange === "month") return Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, "0"));
    if (timeRange === "y") {
      const currentYear = new Date().getFullYear();
      return Array.from({ length: 5 }, (_, i) => (currentYear - 4 + i).toString());
    }
    return [];
  };

  const getDisplayLabels = (labels) => {
    if (timeRange === "month") {
      return labels.map((label) => monthNames[parseInt(label, 10) - 1] || label);
    }
    return labels;
  };

  const extractLabel = (entryTime) => {
    try {
      if (timeRange === "m") return parseInt(entryTime.split(":")[1], 10).toString();
      if (timeRange === "h") return entryTime.split(" ")[1].split(":")[0];
      if (timeRange === "d") return entryTime.split("-")[2].padStart(2, "0");
      if (timeRange === "month") return entryTime.split("-")[1]; // e.g., "01", "02"
      if (timeRange === "y") return entryTime.split("-")[0];
    } catch (error) {
      console.warn("Invalid time format:", entryTime);
    }
    return entryTime;
  };

  useEffect(() => {
    if (!ownerId || !timeRange) return;
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/get_energy_consumption/?owner=${ownerId}&range=${timeRange}`)
      .then((res) => res.json())
      .then((resData) => {
        const rawData = resData.data;
        const fixedLabels = getFixedLabels();
        const energyMap = {};

        if (timeRange === "m") {
          let previous = null;
          for (const entry of rawData) {
            const minute = extractLabel(entry.time);
            if (previous !== null && !(minute in energyMap)) {
              const diff = parseFloat((entry.energy - previous).toFixed(3));
              energyMap[minute] = diff > 0 ? diff : 0;
            }
            previous = entry.energy;
          }
        } else {
          for (const entry of rawData) {
            const label = extractLabel(entry.time);
            energyMap[label] = entry.energy_diff ?? entry.energy ?? 0;
          }
        }

        const values = fixedLabels.map((label) => energyMap[label] ?? 0);
        const displayLabels = getDisplayLabels(fixedLabels);

        setEnergyData({
          labels: displayLabels,
          datasets: [
            {
              label: "Energy Consumed (kWh)",
              type: chartType,
              data: values,
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

  useEffect(() => {
    if (!ownerId || !timeRange) return;
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/get_ghg_emission/?owner=${ownerId}&range=${timeRange}`)
      .then((res) => res.json())
      .then((resData) => {
        const rawData = resData.data;
        const fixedLabels = getFixedLabels();
        const ghgMap = {};
        const energyMap = {};

        for (const entry of rawData) {
          const label = extractLabel(entry.time);
          ghgMap[label] = entry.ghg_emission;
          energyMap[label] = entry.energy_diff ?? entry.energy ?? 0;
        }

        const ghgValues = fixedLabels.map((label) => ghgMap[label] ?? 0);
        const energyValues = fixedLabels.map((label) => energyMap[label] ?? 0);
        const displayLabels = getDisplayLabels(fixedLabels);

        setGhgData({
          labels: displayLabels,
          datasets: [
            {
              label: "GHG Emission (g)",
              type: chartType,
              data: ghgValues,
              borderColor: DARK_ORANGE,
              backgroundColor: DARK_ORANGE_BG,
              fill: true,
              tension: 0.4,
            },
            {
              label: "Energy Used (kWh)",
              type: chartType,
              data: energyValues,
              borderColor: "#4caf50",
              backgroundColor: "rgba(76, 175, 80, 0.3)",
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
      tooltip: {
        callbacks: {
          label: (tooltipItem) => {
            const value = tooltipItem.raw;
            return `${tooltipItem.dataset.label}: ${value.toFixed(6)}`;
          },
        },
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: yLabel,
        },
        ticks: {
          callback: (value) => value.toFixed(6),
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
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "flex-start",
        gap: "2rem",
        padding: "2rem",
        overflowX: "auto",
        whiteSpace: "nowrap",
      }}
    >
      <div style={{ width: "700px", height: "400px" }}>
        {!energyData ? (
          <p>Loading energy consumption chart...</p>
        ) : (
          <MyChartComponent
            chartData={energyData}
            chartOptions={chartBaseOptions(`Energy Consumption (Owner ${ownerId})`, "Energy (kWh)")}
          />
        )}
      </div>

      <div style={{ width: "700px", height: "400px" }}>
        {!ghgData ? (
          <p>Loading GHG emissions chart...</p>
        ) : (
          <MyChartComponent
            chartData={ghgData}
            chartOptions={chartBaseOptions(`GHG Emissions & Energy (Owner ${ownerId})`, "Values (g / kWh)")}
          />
        )}
      </div>
    </div>
  );
}
