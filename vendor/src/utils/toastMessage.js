const humanizeMessage = (message) => {
  if (!message || typeof message !== "string") return "";

  return message
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\bid\b/gi, "ID")
    .trim()
    .replace(/^./, (char) => char.toUpperCase());
};

export const getErrorMessage = (
  error,
  fallback = "Something went wrong. Please try again.",
) => {
  const candidates = [
    error?.data?.message,
    error?.data?.error,
    error?.error,
    error?.message,
  ];

  for (const candidate of candidates) {
    const message = humanizeMessage(candidate);
    if (message) return message;
  }

  if (error?.status === "FETCH_ERROR") {
    return "Unable to connect to the server. Please check your internet connection.";
  }

  if (error?.status === 401) {
    return "Your session has expired. Please log in again.";
  }

  if (error?.status === 403) {
    return "You do not have permission to perform this action.";
  }

  if (error?.status === 404) {
    return "The requested record could not be found.";
  }

  return fallback;
};
