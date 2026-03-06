// AboutPage.jsx
import React from "react";
import "./AboutPage.css";

export const AboutPage = () => {
  return (
    <div className="about-page">
      <h2 className="about-title">What is OtiumX?</h2>

      <p className="about-text">
        OtiumX is an AI-powered voice journaling platform designed to help
        people understand patterns in their life. Instead of typing long journal
        entries, users can simply speak about their day.
      </p>

      <p className="about-text">
        The system converts speech into text and stores daily reflections. After
        every 7 journal entries, the AI analyzes those reflections and generates
        a strategic insight report.
      </p>

      <p className="about-text">
        The report highlights patterns across several dimensions:
      </p>

      <ul className="about-list">
        <li>Behavior and thinking loops</li>
        <li>Career engagement signals</li>
        <li>Mental wellbeing patterns</li>
        <li>Physical lifestyle indicators</li>
        <li>Growth opportunities</li>
      </ul>

      <p className="about-text">
        The goal of OtiumX is to turn everyday thoughts into structured
        self-awareness so users can make better long-term decisions.
      </p>

      <h3 className="about-subtitle">How it works</h3>

      <ol className="about-ordered-list">
        <li>Record a voice journal about your day</li>
        <li>The app converts speech to text</li>
        <li>After 7 entries, generate an AI insight report</li>
        <li>Review patterns and strategic recommendations</li>
      </ol>
    </div>
  );
};
