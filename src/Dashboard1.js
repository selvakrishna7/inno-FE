import React, { useEffect, useState } from "react";
import "./Dashboard1.css";

export default function Dashboard1({ ownerId }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!ownerId) return;

    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/get_energy_stats/?owner=${ownerId}`)


      .then((res) => res.json())
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        console.error("Failed to fetch energy stats:", err);
        setStats(null);
      });
  }, [ownerId]);

  if (!stats) {
    return <p className="loading-text">⏳ Loading energy stats for Owner {ownerId}...</p>;
  }

  return (
    <div className="card-container">
      {/* Row 1 */}
      <div className="card-row">
        <div className="orange-card">
          <p>⚡ Today’s Consumption</p>
          <p className="value">
            {stats.one_day_energy} <span className="unit">kWh</span>
          </p>
        </div>
        <div className="orange-card">
          <p>⚡ Month’s Consumption</p>
          <p className="value">
            {stats.one_month_energy} <span className="unit">kWh</span>
          </p>
        </div>
        <div className="orange-card">
          <p>⚡ Year’s Consumption</p>
          <p className="value">
            {stats.one_year_energy} <span className="unit">kWh</span>
          </p>
        </div>
      </div>
      {/* Row 2 */}
      <div className="card-row">
        <div className="orange-card">
          <p>💴 Today’s Expense</p>
          <p className="value">
            {stats.one_day_cost} <span className="unit">BDT</span>
          </p>
        </div>
        <div className="orange-card">
          <p>💴 Month’s Expense</p>
          <p className="value">
            {stats.one_month_cost} <span className="unit">BDT</span>
          </p>
        </div>
        <div className="orange-card">
          <p>💴 Year’s Expense</p>
          <p className="value">
            {stats.one_year_cost} <span className="unit">BDT</span>
          </p>
        </div>
      </div>
    </div>
  );
}
