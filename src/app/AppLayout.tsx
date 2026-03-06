import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth/authSlice";
import bg from "@/assets/bg.jpg";
import { useState } from "react";

export const AppLayout = () => {
  const { user } = useSelector(selectAuth);
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  // Navigation link styling (used for both desktop and mobile)
  const getNavLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    fontWeight: isActive ? "600" : "400",
    color: isActive ? "#2b3a67" : "#334155",
    borderBottom: isActive ? "2px solid #2b3a67" : "none",
    paddingBottom: "4px",
    textDecoration: "none",
    fontSize: "1rem",
  });

  return (
    <div>
      {/* Add style tag for responsive design */}
      <style>{`
        @media (max-width: 768px) {
          .nav-links {
            display: ${menuOpen ? "flex" : "none"};
            flex-direction: column;
            position: absolute;
            top: 70px;
            left: 0;
            right: 0;
            background: rgba(255,255,255,0.95);
            backdrop-filter: blur(8px);
            padding: 1rem 2rem;
            gap: 1rem;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            border-top: 1px solid rgba(0,0,0,0.08);
            z-index: 99;
          }
          .hamburger {
            display: block;
            background: none;
            border: none;
            font-size: 1.8rem;
            cursor: pointer;
            color: #2b3a67;
            padding: 0 0.5rem;
          }
        }
        @media (min-width: 769px) {
          .nav-links {
            display: flex;
            gap: 2rem;
            align-items: center;
          }
          .hamburger {
            display: none;
          }
        }
      `}</style>

      <nav
        style={{
          padding: "1rem 2rem",
          background: "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            background: "linear-gradient(135deg, #2b3a67, #3e5a8a)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          OtiumX
        </div>

        {/* Hamburger button (visible only on mobile) */}
        {user && (
          <button className="hamburger" onClick={toggleMenu}>
            ☰
          </button>
        )}

        {/* Navigation links */}
        {user && (
          <div className="nav-links">
            <NavLink
              to="/"
              style={getNavLinkStyle}
              onClick={() => setMenuOpen(false)} // Close menu after click
            >
              Journal
            </NavLink>
            <NavLink
              to="/reports"
              style={getNavLinkStyle}
              onClick={() => setMenuOpen(false)}
            >
              Reports
            </NavLink>
            <NavLink
              to="/profile"
              style={getNavLinkStyle}
              onClick={() => setMenuOpen(false)}
            >
              My Profile
            </NavLink>
            <NavLink
              to="/about"
              style={getNavLinkStyle}
              onClick={() => setMenuOpen(false)}
            >
              About
            </NavLink>
          </div>
        )}
      </nav>

      <div
        style={{
          padding: "2rem",
          minHeight: "calc(100vh - 70px)",
          backgroundImage: `url(${bg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundAttachment: "fixed",
        }}
      >
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(4px)",
            padding: "2rem",
            borderRadius: "20px",
            boxShadow: "0 12px 30px rgba(0,0,0,0.1)",
            maxWidth: "1000px",
            margin: "0 auto",
          }}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};
