import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";
import { selectReports } from "./reportSlice";
import { generateReportThunk } from "./reportThunks";
import { selectJournal } from "../journal/journalSlice";
import { useState } from "react";
import "./ReportsPage.css"; // import the CSS file

export const ReportsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, latestReport } = useSelector(selectReports);
  const { entries } = useSelector(selectJournal);
  const unevaluatedEntries = Object.values(entries).filter(
    (entry) => !entry.evaluated,
  );

  const [showPopup, setShowPopup] = useState(false);
  const progress = unevaluatedEntries.length;

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
        <h2 className="title">Strategic Life Report</h2>

        <button
          className={`button ${loading ? "loading" : ""}`}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Generate Strategic Report"}
        </button>

        {error && <p className="error">{error}</p>}

        {latestReport && (
          <div className="report-card">
            <Section title="Core Patterns">
              {latestReport.corePatterns?.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </Section>

            <Section title="Career Signals">
              {latestReport.careerDirectionSignals?.map(
                (item: string, i: number) => (
                  <li key={i}>{item}</li>
                ),
              )}
            </Section>

            <Section title="Mental Signals">
              {latestReport.mentalWellbeingSignals?.map(
                (item: string, i: number) => (
                  <li key={i}>{item}</li>
                ),
              )}
            </Section>

            <Section title="Physical Signals">
              {latestReport.physicalLifestyleSignals?.map(
                (item: string, i: number) => (
                  <li key={i}>{item}</li>
                ),
              )}
            </Section>

            <Section title="Risk Factors">
              {latestReport.riskFactors?.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </Section>

            <Section title="Growth Opportunities">
              {latestReport.growthOpportunities?.map(
                (item: string, i: number) => (
                  <li key={i}>{item}</li>
                ),
              )}
            </Section>

            <Section title="Strategic Focus">
              <p>{latestReport.recommendedStrategicFocus}</p>
            </Section>

            <Section title="Compounding Vector">
              <p>{latestReport.compoundingVector}</p>
            </Section>

            <Section title="Immediate Action (Next 7 Days)">
              <p>{latestReport.nextConcreteAction}</p>
            </Section>
          </div>
        )}
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup">
            <h3>Not Enough Journal Entries</h3>
            <p>
              You need <strong>7 journal entries</strong> to generate your
              strategic life report.
            </p>
            <p>
              Current progress: <strong>{progress} / 7</strong>
            </p>
            <button className="popup-close" onClick={() => setShowPopup(false)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Section = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <div className="section">
    <h4 className="section-title">{title}</h4>
    <ul className="section-list">{children}</ul>
  </div>
);
