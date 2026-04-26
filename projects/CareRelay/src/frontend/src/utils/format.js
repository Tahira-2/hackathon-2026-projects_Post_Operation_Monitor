export function display(value, fallback = "Not documented") {
  return value === null || value === undefined || value === "" ? fallback : value;
}

export function titleCase(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function compactCondition(name) {
  return (name || "")
    .replace(" (finding)", "")
    .replace(" (disorder)", "")
    .replace(" (situation)", "");
}

export function shortMedName(name) {
  return (name || "")
    .replace("24 HR ", "")
    .replace("Extended Release ", "")
    .replace("Oral Tablet", "tablet")
    .replace("Injectable Suspension", "injection");
}
