import { Link, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth/authSlice";

export const AppLayout = () => {
  const { user } = useSelector(selectAuth);

  return (
    <div>
      <nav
        style={{
          padding: "1rem 2rem",
          borderBottom: "1px solid #ddd",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <div>
          <strong>OtiumX</strong>
        </div>

        {user && (
          <div style={{ display: "flex", gap: "1rem" }}>
            <Link to="/" style={{ textDecoration: "none" }}>
              Journal
            </Link>

            <Link to="/reports" style={{ textDecoration: "none" }}>
              Reports
            </Link>
          </div>
        )}
      </nav>

      <div style={{ padding: "2rem" }}>
        <Outlet />
      </div>
    </div>
  );
};
