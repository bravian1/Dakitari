# 🩺 Daktari

**Voice-first AI clinical triage for Community Health Volunteers in rural East Africa.**

Daktari (Swahili for "Doctor") lets Community Health Volunteers speak patient symptoms in Swahili, Sheng, or English — and receive an instant AI-powered triage assessment read back aloud. No typing. No reading. Hands-free health triage for workers walking between households.

---

## The Problem

As of 2026, a child with acute malaria or pneumonia in a rural East African district can die within 24 hours if not treated. Ministries of Health rely on Community Health Volunteers (CHVs) to reach patients first — but CHVs lack tools to assess severity on the spot. They walk between homes with no clinical training, no connectivity, and no time.

## The Solution

Daktari puts an AI doctor in the CHV's pocket. The CHV taps, speaks, and listens — the app handles the rest.

1. **Speak** — CHV describes symptoms in Swahili, Sheng, or English
2. **Triage** — Gemini AI classifies severity, identifies the likely condition, and generates actionable next steps
3. **Listen** — The result is read aloud so the CHV can act immediately without reading the screen

## Features

- **Voice-First Interaction** — Speech-to-text input with live transcription and text-to-speech output via the Web Speech API
- **Text Chat Fallback** — Full chat interface for typed input when voice isn't available
- **AI-Powered Triage** — Structured clinical assessment via Google Gemini including severity level, matched symptoms, likely condition, and recommended actions
- **Bilingual (Swahili / English)** — Full language toggle that switches UI, speech recognition, triage output, and voice playback
- **Consultation History** — Session log of all past triage results for reference and reporting
- **Mobile-First** — Built for basic Android smartphones on slow connections

## Tech Stack

- **Frontend:** React, Tailwind CSS
- **AI:** Google Gemini API (`gemini-2.0-flash`)
- **Voice:** Web Speech API (SpeechRecognition + SpeechSynthesis)
- **Backend:** Firebase (Firestore, Auth, Hosting)

## Getting Started

### Prerequisites

- Node.js 18+
- A Google Gemini API key ([get one here](https://aistudio.google.com/apikey))

### Installation

```bash
git clone https://github.com/your-username/daktari.git
cd daktari
npm install
npm run dev
```

On first load, the app will prompt you to enter your Gemini API key.

## Usage

1. **Select language** — Toggle between Swahili (default) and English
2. **Tap the microphone** — Speak the patient's symptoms naturally
3. **Review the triage card** — See severity, condition, matched symptoms, and recommended actions
4. **Listen to the result** — Daktari reads the assessment aloud automatically
5. **Take action** — Follow the recommended steps, save the report, or start a new consultation

Alternatively, switch to chat mode and type symptoms directly.

## Example

> **CHV speaks:** "Mtoto ana homa siku mbili, anatapika, na jasho usiku"
>
> **Daktari responds:**
> - 🔴 **HATARI KUBWA** (Critical)
> - **Condition:** Malaria Kali (Acute Malaria)
> - **Matched symptoms:** Homa kali, Kutapika, Jasho usiku
> - **Action:** Mpeleke mtoto hospitali SASA. Mpe maji ya ORS wakati mnaenda.

## Built For

The [Google AI for Africa Buildathon](https://ai.google.dev/) — East Africa Track, AI for Finance (Health) thematic area.

## Team

Built with ❤️ from Nairobi, Kenya.

## License

MIT
