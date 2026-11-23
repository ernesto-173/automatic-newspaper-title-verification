
# TitleVerify – Automatic Newspaper and Media Title Verification System

An automated web application developed for **26CS101 – Software Development Practices** (Sri Krishna College of Engineering and Technology) to prevent the registration of duplicate or confusingly similar newspaper and media titles.

## Features
- **Title Normalization:** Converts proposed titles to lowercase and strips spaces and special symbols.
- **Fuzzy Search & Similarity Scoring:** Evaluates spelling similarity using a weighted combination of **Jaro-Winkler Similarity (60%)** and **Levenshtein Ratio (40%)**.
- **Phonetic Matching:** Uses **Double Metaphone** phonetic encoding to detect titles that sound alike despite different spellings.
- **Automated Decision Classification:**
  - **80% and above:** Proceed
  - **60% – 79%:** Under Review
  - **Below 60%:** Reject

## Team Members (I Year CSE – 'C' Section)
- **Ernesto Rafael R J** – 26CS212 (Product Owner / Project Planning)
- **Dharageshwaran M** – 26CS164 (Scrum Master / Algorithm Development)
- **Fareez A** – 26CS214 (Development)
- **Dharsan V** – 26CS171 (Testing & Integration)

## How to Run
Open `index.html` in any modern web browser or visit the deployed GitHub Pages URL.
```[cite: 1]
