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
  const now = Math.floor(Date.now() / 1000); // Convert current time to seconds
  const time_left = deadline - now; // Calculate time left in seconds

  const dateObject = new Date(deadline * 1000);
  console.log(dateObject)
  const year = dateObject.getFullYear();
  const month = String(dateObject.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(dateObject.getDate()).padStart(2, "0");

  const formattedDate = `${year}-${month}-${day}`;

  const timeLeftFormatted =
    time_left > 0 ? formatTime(time_left * 1000) : formattedDate;
  return timeLeftFormatted;
};
