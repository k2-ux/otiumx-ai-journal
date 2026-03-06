import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";
import { selectReports } from "./reportSlice";
import { generateReportThunk } from "./reportThunks";
import { selectJournal } from "../journal/journalSlice";
import { useState } from "react";
import "./ReportsPage.css";

import placeholderImage from "@/assets/report-placeholder.png";

export const ReportsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, latestReport } = useSelector(selectReports);
  const { entries } = useSelector(selectJournal);

  const unevaluatedEntries = Object.values(entries).filter(
    (entry) => !entry.evaluated,
  );

  const progress = unevaluatedEntries.length;

  const [showPopup, setShowPopup] = useState(false);

  const handleGenerate = () => {
    if (progress < 7) {
      setShowPopup(true);
      return;
    }
    dispatch(generateReportThunk());
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

        <div className="progress">
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(progress / 7) * 100}%` }}
            />
          </div>
          <span>{progress} / 7 journals ready</span>
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
          <div className="report-card">{/* your sections here */}</div>
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
