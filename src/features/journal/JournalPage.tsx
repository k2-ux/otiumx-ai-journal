import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch } from "@/store";
import { selectAuth } from "@/features/auth/authSlice";
import { selectJournal } from "./journalSlice";
import { createEntryThunk, fetchEntriesThunk } from "./journalThunks";
import { logoutThunk } from "@/features/auth/authThunks";
import { getFunctions, httpsCallable } from "@firebase/functions";
import { app } from "@/firebase/config";
import "./JournalPage.css"; // import the CSS file

// const languages: Record<string, string> = {
//   english: "en",
//   bengali: "bn",
//   hindi: "hi",
//   kannada: "kn",
//   malayalam: "ml",
// };

export const JournalPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector(selectAuth);
  const { entries, loading, error } = useSelector(selectJournal);
  const unevaluatedEntries = Object.values(entries).filter(
    (entry) => !entry.evaluated,
  );

  const progress = unevaluatedEntries.length;
  const [transcript, setTranscript] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [inputLanguage, setInputLanguage] = useState("english");
  const [moodScore, setMoodScore] = useState(5);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [recordTime, setRecordTime] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunks = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const today = new Date().toISOString().split("T")[0];
  const functions = getFunctions(app, "us-central1");
  const transcribe = httpsCallable(functions, "transcribeAudio");
  const alreadySubmittedToday = entries[today];

  useEffect(() => {
    if (user) {
      dispatch(fetchEntriesThunk({ userId: user.uid }));
    }
  }, [user, dispatch]);

  // RECORD TIMER
  useEffect(() => {
    if (!isRecording) return;

    timerRef.current = setInterval(() => {
      setRecordTime((t) => t + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    setTranscript("");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    audioChunks.current = [];
    setRecordTime(0);

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.current.push(event.data);
      }
    };

    mediaRecorder.onstop = processAudio;

    mediaRecorder.start(1000);

    setIsRecording(true);

    // AUTO STOP (2 minutes)
    setTimeout(() => {
      if (mediaRecorder.state !== "inactive") {
        stopRecording();
      }
    }, 120000);
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current) return;

    mediaRecorderRef.current.stop();
    setIsRecording(false);

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64data = reader.result as string;
        const base64 = base64data.split(",")[1];
        resolve(base64);
      };

      reader.onerror = reject;

      reader.readAsDataURL(blob);
    });
  };

  const processAudio = async () => {
    const blob = new Blob(audioChunks.current, { type: "audio/webm" });

    if (blob.size === 0) {
      console.warn("Empty recording");
      return;
    }

    const base64Audio = await blobToBase64(blob);

    try {
      setIsTranscribing(true);
      console.log("audio size:", blob.size);
      const result: any = await transcribe({
        audio: base64Audio,
      });

      setTranscript(result.data.text || "");
    } catch (err) {
      console.error("Transcription error:", err);
    } finally {
      setIsTranscribing(false);
    }
  };

  const handleSave = async () => {
    if (!user || !transcript) return;

    if (isRecording) {
      stopRecording();
    }

    await dispatch(
      createEntryThunk({
        userId: user.uid,
        date: today,
        content: transcript,
        moodScore,
      }),
    );

    setTranscript("");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="journal-page">
      <div className="container">
        <div className="header">
          <h2 className="title">Journal</h2>
          <button
            className="logout-button"
            onClick={() => dispatch(logoutThunk())}
          >
            Logout
          </button>
        </div>

        <div className="progress-section">
          <strong>Weekly Insight Progress</strong>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${Math.min((progress / 7) * 100, 100)}%` }}
            />
          </div>
          <p className="progress-text">{progress} / 7 entries completed</p>
        </div>

        <div className="entry-form">
          <h3 className="section-title">Today's Entry ({today})</h3>

          <div className="form-group">
            <label htmlFor="language">Input Language:</label>
            <select
              id="language"
              className="language-select"
              value={inputLanguage}
              onChange={(e) => setInputLanguage(e.target.value)}
            >
              <option value="english">English</option>
              <option value="bengali">Bengali</option>
              <option value="hindi">Hindi</option>
              <option value="kannada">Kannada</option>
              <option value="malayalam">Malayalam</option>
            </select>
          </div>

          <div className="record-controls">
            <button
              className="record-button"
              onClick={startRecording}
              disabled={isRecording}
            >
              🎤 Record
            </button>
            <button
              className="stop-button"
              onClick={stopRecording}
              disabled={!isRecording}
            >
              Stop
            </button>
          </div>

          {isRecording && (
            <p className="recording-indicator">
              Recording... {formatTime(recordTime)} / 2:00
            </p>
          )}

          {isTranscribing && (
            <p className="transcribing-indicator">Processing voice...</p>
          )}

          <div className="transcript-section">
            <p className="transcript-label">
              <strong>Transcript:</strong>
            </p>
            <div className="transcript-box">
              {transcript || "Your spoken journal will appear here..."}
            </div>
          </div>

          <div className="form-group mood-group">
            <label htmlFor="mood">Mood (1–10):</label>
            <input
              id="mood"
              type="number"
              min={1}
              max={10}
              value={moodScore}
              onChange={(e) => setMoodScore(Number(e.target.value))}
              className="mood-input"
            />
          </div>

          <button
            className="save-button"
            onClick={handleSave}
            disabled={loading || !transcript || !!alreadySubmittedToday}
          >
            {alreadySubmittedToday
              ? "Today's Entry Already Submitted"
              : loading
                ? "Saving..."
                : "Save Entry"}
          </button>

          {error && <p className="error">{error}</p>}
        </div>

        <hr className="divider" />

        <h3 className="section-title">All Entries</h3>

        {Object.values(entries).length === 0 && (
          <p className="no-entries">No entries yet.</p>
        )}

        <div className="entries-list">
          {Object.values(entries)
            .sort((a, b) => b.id.localeCompare(a.id))
            .map((entry) => (
              <div key={entry.id} className="entry-item">
                <div className="entry-header">
                  <strong className="entry-date">{entry.id}</strong>
                  <span className="entry-mood">Mood: {entry.moodScore}</span>
                </div>
                <p className="entry-content">{entry.content}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
