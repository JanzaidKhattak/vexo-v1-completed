// "2 hours ago", "3 days ago" etc
export const timeAgo = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000); // seconds

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)} weeks ago`;

  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// "Jan 26, 2025"
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// "Jan 26, 2025 — 3:45 PM"
export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }) +
    " — " +
    date.toLocaleTimeString("en-PK", {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
};