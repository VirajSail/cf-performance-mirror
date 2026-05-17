# 📊 Codeforces Performance Mirror

![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-yellow)
![Codeforces API](https://img.shields.io/badge/Codeforces-API-red)
![License](https://img.shields.io/badge/license-MIT-blue)

A **Chrome extension** that transforms your Codeforces profile into a powerful performance dashboard. See your **efficiency score**, track your **progress over time**, identify your **weakest tag**, and never miss a contest – all inside your profile page.

![Screenshot]
<img width="902" height="1276" alt="image" src="https://github.com/user-attachments/assets/0c7fcd23-42dd-4291-b14b-7998b0bafede" />


<!-- You can add a screenshot later -->

## ✨ Features

| Feature | Description |
|---------|-------------|
| **⏱️ Time Machine** | Drag a slider to see your stats at any point in the past (solved count, accuracy, average rating). |
| **🎯 Efficiency Score** | A 0–100 score combining accuracy, solve speed, and average problem rating. |
| **📊 Problems Solved by Tag** | Column chart showing how many problems you solved per tag (top 10 + others). |
| **🔥 Weakness of the Day** | Detects your least‑solved tag and suggests an unsolved problem at the right difficulty. |
| **⏰ Contest Reminder** | Live countdown to the next Codeforces contest with a direct link. |
| **📈 Rating Distribution** | Bar chart of solved problem ratings (100‑step buckets from 800 to 3500). |
| **🏷️ All Tags (scrollable)** | Every tag you’ve ever solved, sorted by frequency. |
| **📅 Last 7 Days Solved** | Tracks recent activity. |
| **⚡ Accuracy & Avg Solve Time** | Classic metrics, correctly computed (never >100% accuracy). |

All data is cached for 5 minutes – fast and API‑friendly.

## 🛠️ Tech Stack

- **Manifest V3** – Modern Chrome extension platform
- **Vanilla JavaScript** – No frameworks, pure DOM manipulation
- **CSS3** – Glassmorphism, flexbox, grid, animations
- **Codeforces API** – `user.status`, `contest.list`, `problemset.problems`
- **Chrome Storage API** – Caching with 5‑minute TTL

## 📦 Installation

### From source (developer mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/VirajSail/cf-performance-mirror.git
