import React, { useEffect, useState } from "react";
import Dashboard1 from "./Dashboard1";
import Dashboard2 from "./Dashboard2";
import Dashboard3 from "./Dashboard3";
import Dashboard4 from "./Dashboard4";
import { Menu, X } from "lucide-react";
import "./Dashboard.css";
import "./Sidebar.css";

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [owners, setOwners] = useState([]);
  const [timeRange, setTimeRange] = useState("d"); // default: daily view

  useEffect(() => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/owners/`)
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.unique_owners.filter((owner) => owner !== null);
        setOwners(filtered);
        setSelectedOwner(filtered[0]);
      })
      .catch((err) => console.error("Error fetching owners:", err));
  }, []);

  const handleOwnerClick = (ownerId) => {
    setSelectedOwner(ownerId);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
  };

  const timeOptions = ["m", "h", "d", "M", "y"];

  return (
    <div className="dashboard-wrapper">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          <h2>☀️ Owners</h2>
          <button onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <ul className="sidebar-links">
          {owners.map((owner) => (
            <li
              key={owner}
              className={`owner-link ${owner === selectedOwner ? "active" : ""}`}
              onClick={() => handleOwnerClick(owner)}
            >
              {owner}
            </li>
          ))}
        </ul>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {!sidebarOpen && (
          <button className="open-btn" onClick={() => setSidebarOpen(true)}>
            <Menu size={24} />
          </button>
        )}

        <h1 className="text-2xl font-bold mb-4">
          ⚡ Energy Dashboard - Owner {selectedOwner}
        </h1>

        {selectedOwner && (
          <>
            <Dashboard1 key={selectedOwner} ownerId={selectedOwner} />

            {/* Time Range Buttons - Below Cards, Left-Aligned */}
            <div className="time-range-selector mb-6">
              {timeOptions.map((range) => (
                <button
                  key={range}
                  onClick={() => handleTimeRangeChange(range)}
                  className={`time-button ${range === timeRange ? "active" : ""}`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Graph Section */}
            <div className="graph-section">
              <Dashboard2 key={`d2-${selectedOwner}-${timeRange}`} ownerId={selectedOwner} timeRange={timeRange} />
              <Dashboard3 key={`d3-${selectedOwner}-${timeRange}`} ownerId={selectedOwner} timeRange={timeRange} />
              <Dashboard4 key={`d4-${selectedOwner}-${timeRange}`} ownerId={selectedOwner} timeRange={timeRange} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
