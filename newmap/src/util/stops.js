export function getShortStopId(longId) {
  return longId.split("_")[1]; // can be undefined.
}

export function isStreetcarStop(stop) {
  return stop.name.lastIndexOf(" SC") == stop.name.length - 3;
}

export function isAtStation(stop) {
  return (
    stop.name.indexOf(" STATION") >= 0 && stop.name.indexOf(" STATION)") == -1
  );
}

export function getModeClass(route) {
  switch (route) {
    case "BLUE":
    case "GOLD":
    case "GREEN":
    case "RED":
      return "rail-line";
    case "ATLSC":
      return "tram-line";
    default:
      return "bus";
  }
}

export function getLetterGrade(score) {
  if (score >= 90) return "A";
  else if (score >= 80) return "B";
  else if (score >= 70) return "C";
  else if (score >= 60) return "D";
  else return "F";
}
