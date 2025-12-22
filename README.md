<!-- @format -->

# QA Automation Monorepo

This repository hosts the automated test suites for multiple client websites.
Each site is isolated in its own directory with its own configuration, secrets, and schedule.

## 📂 Project Structure

| Folder      | Client         | Description                                       |
| :---------- | :------------- | :------------------------------------------------ |
| `/igotmind` | **I Got Mind** | Student Dashboard, Public Pages & Email Reporting |
| `/siteB`    | _Coming Soon_  | _Placeholder for future client site_              |

---

## 🚀 How to Run Manually (Cloud)

To trigger a test run immediately:

1.  Go to the **[Actions Tab]**.
2.  On the left sidebar, select the specific workflow (e.g., **"I Got Mind: Automation"**).
3.  Click the **Run workflow** button on the right side.
4.  Select click the **Run workflow** button.

---

## 📅 Schedules

The automation runs automatically based on the schedules defined in `.github/workflows/`.

| Client         | Schedule (IST)          | Cron Syntax  |
| :------------- | :---------------------- | :----------- |
| **I Got Mind** | Saturdays @ 9:00 AM IST | `30 3 * * 6` |

_(Note: GitHub uses UTC time. IST is UTC +5:30)._

---
