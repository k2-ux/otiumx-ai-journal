import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerThunk } from "./authThunks";
import { selectAuth } from "./authSlice";
import type { AppDispatch } from "@/store";
import { useNavigate, Link } from "react-router-dom";

export const RegisterPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { loading, error } = useSelector(selectAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [touched, setTouched] = useState({ email: false, password: false });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await dispatch(registerThunk({ email, password })).unwrap();
      navigate("/");
    } catch {
      // handled in slice
    }
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const isEmailValid = email.includes("@") && email.includes(".");
  const isPasswordValid = password.length >= 6;
  const showEmailError = touched.email && !isEmailValid;
  const showPasswordError = touched.password && !isPasswordValid;

  return (
    <div className="register-page">
      <style>{`
        .register-page {
          min-height: 100vh;
          min-height: 100dvh;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          box-sizing: border-box;
        }

        /* Ensure all elements use border-box */
        .register-page *,
        .register-page *:before,
        .register-page *:after {
          box-sizing: border-box;
        }

        .register-card {
          background: white;
          border-radius: clamp(16px, 5vw, 24px);
          box-shadow: 0 15px 50px rgba(0, 0, 0, 0.12);
          padding: clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 3rem);
          width: 100%;
          max-width: min(100%, 650px);
          animation: fadeIn 0.5s ease;
          margin: auto;
          overflow: hidden; /* Prevent any child overflow */
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .register-title {
          text-align: center;
          color: #333;
          font-size: clamp(1.5rem, 6vw, 2.4rem);
          font-weight: 600;
          margin-bottom: clamp(1rem, 4vh, 2rem);
          letter-spacing: -0.5px;
          line-height: 1.2;
          word-wrap: break-word;
        }

        .register-form {
          display: flex;
          flex-direction: column;
          gap: clamp(1rem, 3vh, 2rem);
          width: 100%;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
          width: 100%;
        }

        .input-group label {
          color: #555;
          font-size: clamp(0.8rem, 3vw, 1rem);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding-left: 0.2rem;
        }

        .input-group input {
          width: 100%;
          padding: clamp(0.7rem, 3vw, 1.2rem) clamp(0.8rem, 4vw, 1.5rem);
          border: 2px solid ${showEmailError || showPasswordError ? "#ff6b6b" : "#e0e0e0"};
          border-radius: clamp(8px, 3vw, 14px);
          font-size: clamp(0.9rem, 4vw, 1.1rem);
          transition: border-color 0.3s, box-shadow 0.3s;
          outline: none;
          -webkit-appearance: none;
          appearance: none;
          max-width: 100%;
        }

        .input-group input:focus {
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .input-group input::placeholder {
          color: #aaa;
          opacity: 0.8;
        }

        @media (max-width: 768px) {
          .input-group input {
            min-height: 44px;
            padding: 0.7rem 0.8rem; /* Slightly smaller padding on mobile */
          }
          
          .register-card {
            padding: 1.5rem 1rem; /* Reduced horizontal padding on mobile */
          }
        }

        .validation-hint {
          font-size: clamp(0.7rem, 2.5vw, 0.85rem);
          color: #666;
          margin-top: 0.2rem;
          padding-left: 0.5rem;
          word-wrap: break-word;
        }

        .validation-error {
          color: #ff6b6b;
          font-size: clamp(0.7rem, 2.5vw, 0.85rem);
          margin-top: 0.2rem;
          padding-left: 0.5rem;
          animation: shake 0.3s ease;
          word-wrap: break-word;
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(5px); }
          75% { transform: translateX(-5px); }
        }

        .register-button {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: clamp(0.8rem, 4vw, 1.2rem);
          border-radius: clamp(8px, 3vw, 14px);
          font-size: clamp(1rem, 4vw, 1.2rem);
          font-weight: 600;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
          margin-top: clamp(0.3rem, 2vh, 1rem);
          width: 100%;
          min-height: 44px;
          -webkit-tap-highlight-color: transparent;
        }

        .register-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(102, 126, 234, 0.4);
        }

        .register-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .register-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background-color: #fee;
          color: #c33;
          padding: clamp(0.7rem, 3vw, 1.2rem);
          border-radius: clamp(8px, 3vw, 12px);
          margin-top: clamp(1rem, 4vh, 1.8rem);
          font-size: clamp(0.85rem, 3.5vw, 1rem);
          border: 1px solid #fcc;
          text-align: center;
          word-break: break-word;
          width: 100%;
        }

        .register-footer {
          text-align: center;
          margin-top: clamp(1.5rem, 5vh, 2.5rem);
          color: #666;
          font-size: clamp(0.85rem, 3.5vw, 1.1rem);
          word-wrap: break-word;
        }

        .register-footer a {
          color: #667eea;
          text-decoration: none;
          font-weight: 500;
          transition: color 0.2s;
          padding: 0.3rem 0.8rem;
          display: inline-block;
        }

        .register-footer a:hover {
          color: #764ba2;
          text-decoration: underline;
        }

        /* Desktop-specific refinements */
        @media (min-width: 1024px) {
          .register-card {
            max-width: 700px;
            padding: 3.5rem 3.5rem;
          }

          .register-title {
            font-size: 2.6rem;
            margin-bottom: 2.2rem;
          }

          .input-group label {
            font-size: 1.1rem;
          }

          .input-group input {
            padding: 1.3rem 1.6rem;
            font-size: 1.15rem;
          }

          .register-button {
            padding: 1.3rem;
            font-size: 1.25rem;
          }

          .register-footer {
            font-size: 1.15rem;
            margin-top: 2.8rem;
          }
        }

        /* Ultra-wide screens */
        @media (min-width: 1600px) {
          .register-card {
            max-width: 750px;
            padding: 4rem 4rem;
          }

          .register-title {
            font-size: 2.8rem;
          }
        }

        /* Landscape orientation adjustments for mobile */
        @media (max-width: 768px) and (orientation: landscape) {
          .register-page {
            padding: 0.5rem;
            align-items: flex-start;
            overflow-y: auto;
          }

          .register-card {
            margin: 1rem auto;
            padding: 1.5rem;
          }

          .register-form {
            gap: 1rem;
          }
        }

        /* Handle very small screens */
        @media (max-width: 320px) {
          .register-card {
            padding: 1rem 0.8rem;
          }

          .register-title {
            font-size: 1.3rem;
          }
          
          .input-group input {
            padding: 0.6rem;
          }
        }

        /* Print styles */
        @media print {
          .register-page {
            background: white;
            padding: 0;
          }

          .register-card {
            box-shadow: none;
            border: 1px solid #ddd;
          }

          .register-button {
            display: none;
          }
        }
      `}</style>

      <div className="register-card">
        <h2 className="register-title">Create Account</h2>

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          <div className="input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur("email")}
              required
              aria-invalid={showEmailError}
              aria-describedby={showEmailError ? "email-error" : "email-hint"}
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
            />
            {!showEmailError && (
              <div id="email-hint" className="validation-hint">
                Enter a valid email address
              </div>
            )}
            {showEmailError && (
              <div id="email-error" className="validation-error" role="alert">
                Please enter a valid email address
              </div>
            )}
          </div>

          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur("password")}
              required
              minLength={6}
              aria-invalid={showPasswordError}
              aria-describedby={
                showPasswordError ? "password-error" : "password-hint"
              }
              autoCapitalize="none"
              autoCorrect="off"
            />
            {!showPasswordError && (
              <div id="password-hint" className="validation-hint">
                Minimum 6 characters
              </div>
            )}
            {showPasswordError && (
              <div
                id="password-error"
                className="validation-error"
                role="alert"
              >
                Password must be at least 6 characters
              </div>
            )}
          </div>

          <button
            type="submit"
            className="register-button"
            disabled={
              loading ||
              !email ||
              !password ||
              !isEmailValid ||
              !isPasswordValid
            }
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <p className="register-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};
