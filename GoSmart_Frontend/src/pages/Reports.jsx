import { useState } from "react";
import TrafficSection from "../components/reports/TrafficSection";
import BusSection from "../components/reports/BusSection";

const SECTIONS = [
  { value: "traffic", label: "Traffic reports" },
  { value: "bus", label: "Bus reports" },
];

/** Two kinds of rider report under one tab: what's on the road, and what's on the bus. */
export default function Reports() {
  const [section, setSection] = useState("traffic");

  return (
    <div className="screen">
      <div className="screen-title">Reports</div>
      <div className="screen-sub">What riders are seeing</div>

      <div className="segmented" role="tablist">
        {SECTIONS.map((s) => (
          <button
            key={s.value}
            role="tab"
            aria-selected={section === s.value}
            className={section === s.value ? "is-active" : ""}
            onClick={() => setSection(s.value)}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === "traffic" ? <TrafficSection /> : <BusSection />}
    </div>
  );
}
