export function formatTime(epochTime: number): string {
  const totalSeconds = Math.floor(epochTime / 1000); // epochTime is in milliseconds, so divide by 1000

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (totalSeconds < 60) {
    return `${seconds}sec`;
  } else if (totalSeconds < 3600) {
    return `${minutes}min ${seconds}sec`;
  } else if (totalSeconds < 86400) {
    return `${hours}hrs ${minutes}min`;
  } else {
    return `${days}d ${hours}hrs ${minutes}min`;
  }
}

export const timeLeft = (deadline: number) => {
  const now = Math.floor(Date.now() / 1000);
  const remaining = deadline - now;

  if (remaining <= 0) return "Expired";

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = Math.floor(remaining % 60);

  let timeString = "";
  if (days > 0) timeString += `${days}d `;
  if (hours > 0 || days > 0) timeString += `${hours}h `;
  if (minutes > 0 || hours > 0 || days > 0) timeString += `${minutes}m `;
  timeString += `${seconds}s`;

  return timeString;
};
