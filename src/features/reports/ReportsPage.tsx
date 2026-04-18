import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";
import { selectReports } from "./reportSlice";
import { generateReportThunk } from "./reportThunks";
import { selectJournal } from "../journal/journalSlice";
import { useState } from "react";
import "./ReportsPage.css";

import placeholderImage from "@/assets/report-placeholder.png";

const Section = ({ title, items }: { title: string; items?: string[] }) => {
  if (!items || items.length === 0) return null;
  return (
    <div className="report-section">
      <h4>{title}</h4>
      <ul>
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </div>
  );
};

export const ReportsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, latestReport } = useSelector(selectReports);
  const { entries } = useSelector(selectJournal);

  const totalEntries = Object.values(entries).length;
  const progress = Math.min(totalEntries, 7);

  const [showPopup, setShowPopup] = useState(false);
  const [language, setLanguage] = useState("english");

  const handleGenerate = () => {
    if (progress < 7) {
      setShowPopup(true);
      return;
    }
    dispatch(generateReportThunk({ language }));
  };

  return (
    <div className="reports-page">
      <div className="container">
        <div className="hero">
          <h2>Strategic Life Report</h2>
          <p>
            AI analyzes your last 7 journal entries to detect patterns in your
            thinking, career direction, wellbeing, and growth opportunities.
          </p>
        </div>

        {progress < 7 && (
          <div className="progress">
            <span>
              You need {7 - progress} more {7 - progress === 1 ? "journal" : "journals"} to get started with report generation, remember you can only add one journal each day.
            </span>
          </div>
        )}

        <div className="language-picker">
          <label htmlFor="report-language">Report Language:</label>
          <select
            id="report-language"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="english">English</option>
            <option value="bengali">Bengali</option>
            <option value="hindi">Hindi</option>
            <option value="kannada">Kannada</option>
            <option value="malayalam">Malayalam</option>
          </select>
        </div>

        <button
          className={`generate-button ${loading ? "loading" : ""}`}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Analyzing Your Journals..." : "Generate Strategic Report"}
        </button>

        {error && <p className="error">{error}</p>}

        {!latestReport && !loading && !error && (
          <div className="placeholder-container">
            <img
              src={placeholderImage}
              alt="No report yet"
              className="placeholder-image"
            />
            <p>Your strategic report will appear here once generated.</p>
          </div>
        )}

        {latestReport && (
          <div className="report-card">
            <Section title="Core Patterns" items={latestReport.corePatterns} />
            <Section title="Career Direction Signals" items={latestReport.careerDirectionSignals} />
            <Section title="Mental Wellbeing Signals" items={latestReport.mentalWellbeingSignals} />
            <Section title="Physical & Lifestyle Signals" items={latestReport.physicalLifestyleSignals} />
            <Section title="Risk Factors" items={latestReport.riskFactors} />
            <Section title="Growth Opportunities" items={latestReport.growthOpportunities} />

            <div className="report-section">
              <h4>Recommended Strategic Focus</h4>
              <p>{latestReport.recommendedStrategicFocus}</p>
            </div>

            <div className="report-section">
              <h4>Next Concrete Action</h4>
              <p>{latestReport.nextConcreteAction}</p>
            </div>

            <div className="report-section">
              <h4>Compounding Vector</h4>
              <p>{latestReport.compoundingVector}</p>
            </div>
          </div>
        )}
      </div>

      {showPopup && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Not Enough Journals</h3>

            <p>
              You need <strong>7 journal entries</strong> before generating a
              strategic report.
            </p>

            <div className="modal-progress">
              <div
                className="modal-fill"
                style={{ width: `${(progress / 7) * 100}%` }}
              />
            </div>

            <p>
              Current progress: <strong>{progress} / 7</strong>
            </p>

            <button
              className="modal-button"
              onClick={() => setShowPopup(false)}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
