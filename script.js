// ------------------------------------------------------------
// 1. SAMPLE DATABASE
// These are only demo titles for your frontend presentation.
// In a real project, these would come from a backend/database.
// ------------------------------------------------------------
const registeredTitles = [
  "Daily Sun",
  "Metro Voice",
  "National Times",
  "Morning Herald",
  "City News Network",
  "People's Chronicle",
  "Digital Bharat",
  "Public View",
  "News Horizon",
  "Media Today"
];

// Show the sample titles on the page.
const titleList = document.getElementById("titleList");

registeredTitles.forEach((title, index) => {
  const item = document.createElement("div");
  item.className = "title-chip";
  item.innerHTML = `
    <span>${title}</span>
    <span>ID ${String(index + 1).padStart(3, "0")}</span>
  `;
  titleList.appendChild(item);
});

// ------------------------------------------------------------
// 2. NORMALIZE THE TITLE
// Example: "Daily Sun!" becomes "dailysun"
// ------------------------------------------------------------
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// ------------------------------------------------------------
// 3. LEVENSHTEIN DISTANCE
// Counts how many character edits are needed to change
// one word into another.
// ------------------------------------------------------------
function levenshteinDistance(a, b) {
  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

// Convert the edit distance into a percentage similarity.
function levenshteinSimilarity(a, b) {
  const longestLength = Math.max(a.length, b.length);

  if (longestLength === 0) return 100;

  const distance = levenshteinDistance(a, b);
  return (1 - distance / longestLength) * 100;
}

// ------------------------------------------------------------
// 4. SIMPLE PREFIX / SOUND-LIKE BONUS
// This keeps the demo easy to understand.
// Your project presentation mentions Jaro-Winkler and
// Double Metaphone. A production backend can implement them.
// ------------------------------------------------------------
function prefixSimilarity(a, b) {
  const maxPrefix = Math.min(4, a.length, b.length);
  let same = 0;

  for (let i = 0; i < maxPrefix; i++) {
    if (a[i] === b[i]) {
      same++;
    } else {
      break;
    }
  }

  const base = levenshteinSimilarity(a, b);
  const bonus = same * 3;

  return Math.min(100, base + bonus);
}

// ------------------------------------------------------------
// 5. FINAL WEIGHTED SCORE
// Project formula:
// Total Score = 0.4 × Levenshtein + 0.6 × Jaro-Winkler
//
// Here "prefixSimilarity" is used as an easy frontend demo
// approximation of the second similarity measure.
// ------------------------------------------------------------
function calculateScore(input, registered) {
  const lev = levenshteinSimilarity(input, registered);
  const secondSimilarity = prefixSimilarity(input, registered);
