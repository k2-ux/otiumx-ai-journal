import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth/authSlice";
import bg from "@/assets/bg.jpg";

export const AppLayout = () => {
  const { user } = useSelector(selectAuth);

  // Navigation link styling
  const getNavLinkStyle = ({ isActive }: { isActive: boolean }) => ({
    fontWeight: isActive ? "600" : "400",
    color: isActive ? "#2b3a67" : "#334155",
    borderBottom: isActive ? "1px solid #2b3a67" : "none",
    paddingBottom: "4px",
  });

  return (
    <div>
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

        {user && (
          <div style={{ display: "flex", gap: "2rem", alignItems: "center" }}>
            <NavLink
              to="/"
              style={getNavLinkStyle}
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Journal
            </NavLink>
            <NavLink
              to="/reports"
              style={getNavLinkStyle}
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              Reports
            </NavLink>
            <NavLink
              to="/profile"
              style={getNavLinkStyle}
              className={({ isActive }) => (isActive ? "active-link" : "")}
            >
              My Profile
            </NavLink>
            <NavLink
              to="/about"
              style={getNavLinkStyle}
              className={({ isActive }) => (isActive ? "active-link" : "")}
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
