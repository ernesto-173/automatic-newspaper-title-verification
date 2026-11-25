// ------------------------------------------------------------
// 1. SAMPLE DATABASE
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
// ------------------------------------------------------------
function normalizeTitle(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

// ------------------------------------------------------------
// 3. LEVENSHTEIN DISTANCE & RATIO
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
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function levenshteinSimilarity(a, b) {
  const longestLength = Math.max(a.length, b.length);
  if (longestLength === 0) return 100;
  const distance = levenshteinDistance(a, b);
  return (1 - distance / longestLength) * 100;
}

// ------------------------------------------------------------
// 4. JARO-WINKLER SIMILARITY
// ------------------------------------------------------------
function jaroWinklerSimilarity(s1, s2) {
  if (s1 === s2) return 100;
  const len1 = s1.length;
  const len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0;

  const matchDistance = Math.floor(Math.max(len1, len2) / 2) - 1;
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);

  let matches = 0;
  let transpositions = 0;

  for (let i = 0; i < len1; i++) {
    const start = Math.max(0, i - matchDistance);
    const end = Math.min(i + matchDistance + 1, len2);

    for (let j = start; j < end; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = true;
      s2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0;

  let k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) transpositions++;
    k++;
  }

  const jaro =
    (matches / len1 +
      matches / len2 +
      (matches - transpositions / 2) / matches) /
    3;

  let prefix = 0;
  for (let i = 0; i < Math.min(4, len1, len2); i++) {
    if (s1[i] === s2[i]) prefix++;
    else break;
  }

  return (jaro + prefix * 0.1 * (1 - jaro)) * 100;
}

// ------------------------------------------------------------
// 5. PHONETIC REPRESENTATION (METAPHONE)
// ------------------------------------------------------------
function phoneticCode(word) {
  if (!word) return "";
  return word
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .replace(/PH/g, "F")
    .replace(/KN|GN|PN/g, "N")
    .replace(/WR/g, "R")
    .replace(/([A-Z])\1+/g, "$1")
    .replace(/(?!^)[AEIOUY]/g, "")
    .replace(/C(?=[EIY])/g, "S")
    .replace(/C|Q/g, "K")
    .replace(/Z/g, "S");
}

// ------------------------------------------------------------
// 6. FINAL WEIGHTED SCORE
// Total Score = 0.4 * Levenshtein + 0.6 * Jaro-Winkler
// Plus phonetic similarity boost when sounds match closely
// ------------------------------------------------------------
function calculateScore(input, registered) {
  const lev = levenshteinSimilarity(input, registered);
  const jw = jaroWinklerSimilarity(input, registered);
  let weightedScore = 0.4 * lev + 0.6 * jw;

  const phoneticInput = phoneticCode(input);
  const phoneticReg = phoneticCode(registered);
  const phoneticSim = levenshteinSimilarity(phoneticInput, phoneticReg);

  if (phoneticSim >= 85 && weightedScore < 85) {
    weightedScore = Math.min(100, weightedScore + 8);
  }

  return {
    total: weightedScore,
    phoneticMatch: phoneticSim >= 80
  };
}

// ------------------------------------------------------------
// 7. FIND THE BEST MATCH
// ------------------------------------------------------------
function findBestMatch(userTitle) {
  const normalizedUserTitle = normalizeTitle(userTitle);

  let bestTitle = "";
  let bestScore = -1;
  let phoneticMatch = false;

  registeredTitles.forEach((title) => {
    const normalizedRegistered = normalizeTitle(title);
    const result = calculateScore(normalizedUserTitle, normalizedRegistered);

    if (result.total > bestScore) {
      bestScore = result.total;
      bestTitle = title;
      phoneticMatch = result.phoneticMatch;
    }
  });

  return {
    normalizedUserTitle,
    bestTitle,
    bestScore: Math.round(bestScore),
    phoneticMatch
  };
}

// ------------------------------------------------------------
// 8. DISPLAY DECISION
// 80% or above  -> Reject (Duplicate / Too Similar)
// 60% to 79%    -> Under Review (Manual Check Needed)
// Below 60%     -> Proceed (Unique Title)
// ------------------------------------------------------------
function showResult(userTitle) {
  if (!userTitle.trim()) {
    alert("Please enter a title first.");
    return;
  }

  const result = findBestMatch(userTitle);

  let decision = "";
  let color = "";
  let reason = "";

  if (result.bestScore >= 80) {
    decision = "Reject";
    color = "#ef476f";
    reason = `Similarity is ${result.bestScore}% (80% or above) against "${result.bestTitle}"${result.phoneticMatch ? " with a strong phonetic match" : ""}, so the title is rejected as a duplicate.`;
  } else if (result.bestScore >= 60) {
    decision = "Under Review";
    color = "#ff9f43";
    reason = `Similarity is ${result.bestScore}% (60%–79%) against "${result.bestTitle}", so the title requires manual editorial review.`;
  } else {
    decision = "Proceed";
    color = "#25b979";
    reason = `Similarity is ${result.bestScore}% (below 60%), indicating the proposed title is sufficiently unique to proceed.`;
  }

  document.getElementById("resultBox").classList.remove("hidden");
  document.getElementById("resultText").textContent = decision;
  document.getElementById("scoreCircle").textContent = result.bestScore + "%";
  document.getElementById("scoreCircle").style.background = color;
  document.getElementById("meterFill").style.background = color;
  document.getElementById("meterFill").style.width = result.bestScore + "%";
  document.getElementById("closestTitle").textContent = result.bestTitle;
  document.getElementById("normalizedText").textContent = result.normalizedUserTitle;
  document.getElementById("reasonText").textContent = reason;
}

document.getElementById("verifyBtn").addEventListener("click", () => {
  const userTitle = document.getElementById("titleInput").value;
  showResult(userTitle);
});

document.getElementById("titleInput").addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    showResult(event.target.value);
  }
});

document.querySelectorAll(".example-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.getElementById("titleInput").value = button.textContent;
    showResult(button.textContent);
  });
});
