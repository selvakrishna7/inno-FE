// MyChartComponent.js
import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { Chart } from "react-chartjs-2";

// ✅ Register chart elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function MyChartComponent({ chartData, chartOptions, chartType = "bar" }) {
  if (!chartData) return <p>Loading...</p>;

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <Chart type={chartType} data={chartData} options={chartOptions} />
    </div>
  );
}
