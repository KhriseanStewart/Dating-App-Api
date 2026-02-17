# Dating App API

A scalable and secure dating app REST API built with **Node.js** and **MongoDB**, designed to power modern mobile and web dating applications. This API focuses on smart matching, real-time interactions, safety-first features, and flexible discovery.

---

## ✨ Core Features

### 🔍 Smart Matching

* **Intent-Based Matching** – Match users based on relationship intent (long-term, casual, friends, etc.)
* **Weighted Preferences** – Support must-haves vs nice-to-haves for better compatibility scoring
* **Availability Matching** – Connect users with overlapping free time
* **Soft Re-Introductions** – Re-surface compatible profiles after cooldown periods

---

### 💬 Conversations & Messaging

* **Real-Time Messaging** (WebSockets / Socket.IO ready)
* **Prompted First Messages** – Auto-generated conversation starters based on shared interests
* **Voice Intro Clips** – Short voice notes on profiles for authenticity
* **Date-Ready Mode** – Toggle availability for immediate matches

---

### 🧑‍Profile System

* **Custom User Profiles** with photos, bios, and interests
* **Vibe Tags** – Lifestyle and personality tags with compatibility insights
* **Mini Quests** – Gamified prompts to encourage profile completion
* **Social Vouches** – Optional endorsements from trusted users

---

### 📍 Location-Based Discovery

* **Nearby Matches** using MongoDB 2dsphere geo queries
* **Distance Filters** (km / miles)
* **Activity & Event Matching** – Discover people attending the same events

---

### 🛡️ Safety & Trust

* **Photo Verification Flow** (selfie + pose validation)
* **Block & Report System**
* **DM Rate Limiting & Spam Detection**
* **Safety Check-In** – Share date details with trusted contacts
* **Emergency Panic Trigger** (future-ready)

---

### 💎 Monetization (Optional / Future)

* **Profile Boosts** with fair exposure balancing
* **Rewind Swipes**
* **See Who Liked You** (premium feature)

---

## 🧱 Tech Stack

* **Node.js**
* **Express.js**
* **MongoDB** (with Mongoose)
* **JWT Authentication**
* **WebSockets / Socket.IO** (real-time features)
* **Cloud Storage** (for images & voice clips)

---

## 🗂️ Core Collections

* `users`
* `profiles`
* `swipes`
* `matches`
* `conversations`
* `messages`
* `reports`
* `blocks`
* `events`
* `boosts`

---

## 🚀 API Highlights (Example Endpoints)

* `POST /auth/register`
* `POST /auth/login`
* `GET /matches`
* `POST /swipes`
* `GET /messages/:conversationId`
* `POST /profile/voice-intro`
* `POST /verification/selfie`
* `GET /discover/nearby`

---

## 🎯 Goals

* Reduce ghosting with better conversation starters
* Increase trust through safety-first design
* Support fast MVP development with scalability in mind
* Power mobile apps with clean, flexible endpoints

---

## 📌 Status

This project is under active development and designed to evolve with additional features such as AI-assisted matching, advanced moderation, and in-app events.

---

## 📄 License

MIT License
