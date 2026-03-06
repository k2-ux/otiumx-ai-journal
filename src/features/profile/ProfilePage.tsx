import { useSelector } from "react-redux";
import { selectAuth } from "@/features/auth/authSlice";
import { selectJournal } from "@/features/journal/journalSlice";
import "./ProfilePage.css"; // Import the CSS file

export const ProfilePage = () => {
  const { user } = useSelector(selectAuth);
  const { entries } = useSelector(selectJournal);

  const journalCount = Object.keys(entries).length;

  // Generate avatar initials from email
  const getInitials = () => {
    if (!user?.email) return "?";
    const localPart = user.email.split("@")[0];
    return localPart.charAt(0).toUpperCase();
  };

  return (
    <div className="profile-container">
      <h2 className="profile-title">My Profile</h2>

      <div className="profile-card">
        <div className="profile-avatar">{getInitials()}</div>
        <div className="profile-info">
          <div className="info-row">
            <span className="info-label">Email:</span>
            <span className="info-value">{user?.email}</span>
          </div>
          <div className="info-row">
            <span className="info-label">User ID:</span>
            <span className="info-value">{user?.uid}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Total Journals:</span>
            <span className="info-value">{journalCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
