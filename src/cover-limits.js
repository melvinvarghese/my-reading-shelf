const COVER_REQUEST_LIMIT = 90;
const COVER_REQUEST_WINDOW_MS = 5 * 60 * 1000;

function reserveCoverRequest(history, now = Date.now()) {
  const recent = history.filter(
    (timestamp) => Number.isFinite(timestamp) && timestamp > now - COVER_REQUEST_WINDOW_MS && timestamp <= now,
  );
  if (recent.length >= COVER_REQUEST_LIMIT) {
    return { allowed: false, timestamps: recent };
  }
  return { allowed: true, timestamps: [...recent, now] };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { reserveCoverRequest };
}

if (typeof window !== 'undefined') {
  window.ReadingShelfCoverLimits = { reserveCoverRequest };
}
