# 🧠 Time Travel Bug Demo

This repository is used to demonstrate an AI-powered workflow that investigates which Git commit likely introduced a bug — using GitHub, GPT, and n8n.

---

## 🔍 Scenario

Imagine a teammate reports:

> "Clicking the *Save* button crashes the app. The console shows a null pointer exception on line 102 of `FormHandler.js`."

This workflow will:

1. Analyze the bug description
2. Fetch recent Git commits
3. Ask GPT which commit most likely caused the issue
4. Return the suspected commit with reasoning via Slack or chat

---

## 📁 Repository Structure
