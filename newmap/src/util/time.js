export function formatTime(timeStr) {
  const timeSplit = timeStr.split(":");
  let hour = timeSplit[0]; // can be: "04", "12", "25".
  let ampm = "a";
  if (hour > 24) hour -= 24;
  else if (hour === 12) {
    ampm = "p";
  } else if (hour > 12) {
    hour -= 12;
    ampm = hour === 12 ? "a" : "p"; // 12 is for 24:00 (12 am).
  } else if (hour < 10) {
    hour = hour + 0; // convert to number to remove leading zeros.
  }
  return hour + ":" + timeSplit[1] + ampm;
}
