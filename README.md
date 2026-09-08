### Sethu

**An offline-first, voice-enabled assistant that tells users which Indian government welfare schemes they're eligible for — grounded in real scheme documents, running entirely on a local open-source model.**

Built for the awareness gap, not the eligibility gap: millions of people qualify for schemes like PM Kisan, Ayushman Bharat, and Sukanya Samriddhi Yojana, and never find out — because the portal is English-only, the connection isn't reliable, or the answer they need was never going to arrive in a form they could read.

---

## Why this exists

Most digital government services assume a smartphone-literate user with steady internet and English comfort. Setu is built for the person that assumption leaves out — the community kiosk with one shared device, the anganwadi worker helping families in their own language, the household with two bars of signal and no patience for a form.

It answers in plain language, in English, Hindi, or Tamil, or any other Indian languages by voice or text — and it works with no internet at all, because the model runs on the same device as the question.

---

## How it works

| Stage | What happens |
|---|---|
| **Question in** | Typed, or spoken via the browser's Web Speech API (`SpeechRecognition`) |
| **Language handling** | Non-English questions are translated to English first, so retrieval and reasoning stay consistent |
| **Retrieval (RAG)** | The question is embedded (`nomic-embed-text`) and matched against a local index built from real scheme documents in `data/schemes/` |
| **Reasoning** | `llama3`, running locally via Ollama, generates an answer grounded only in the retrieved context — instructed to say when it's unsure rather than guess |
| **Answer out** | Translated back to the user's selected language if needed, and optionally read aloud (`speechSynthesis`) |

No step in this pipeline calls an external API. No user data — including sensitive details like income or land records typed into a question — leaves the device.

---

## Features

- **100% open-source, local AI** — `llama3` for reasoning, `nomic-embed-text` for retrieval, both served by a local Ollama instance. No API keys, no cloud dependency, no per-query cost.
- **Grounded, not guessed** — every answer is retrieved from real scheme documents before generation, so the assistant can decline to answer rather than invent eligibility rules that could genuinely mislead someone about a government benefit.
- **Multilingual** — English, Hindi, and Tamil, via a translate-at-the-edges approach: reasoning stays in English internally for consistency, translation happens only on the way in and out.
- **Voice in, voice out** — on-device browser speech APIs for both transcription and playback, chosen deliberately over heavy local binaries to keep the deployment footprint small.
- **Deliberately non-generic visual design** — a civic, trustworthy aesthetic rather than the default AI-app look.


---
##  Images
<img width="830" height="690" alt="Screenshot 2026-09-07 230945" src="https://github.com/user-attachments/assets/5df75ed5-d5b4-42c4-9b6f-e3c3b276e45c" />\

<img width="1096" height="789" alt="image" src="https://github.com/user-attachments/assets/e6ee1899-e83d-466a-9d22-5e88d7b3cd7c" />

---
##  Why Setu Stands Out 

- **Absolute Data Privacy**: Users must share sensitive socioeconomic data (income, caste, family size, disabilities) to check eligibility. Because Setu runs 100% locally, **Personally Identifiable Information (PII) never touches a corporate cloud**.
- **Zero-Cost Scalability (No OPEX)**: NGOs, Common Service Centres (CSCs), and Anganwadi workers operate on shoestring budgets. By eliminating external API dependencies, Setu has **zero per-query cost** and can run indefinitely on commodity hardware.
- **Anti-Hallucination Architecture**: In civic tech, a wrong AI answer is dangerous. Setu's strict RAG pipeline grounds every response in official documents. It is explicitly prompted to say *"I don't know"* rather than invent a rule that could falsely raise or crush someone's hopes.
- **Inclusive by Design**: It doesn't assume the user can read English or type on a keyboard. The combination of **Voice-In/Voice-Out** and **Translate-at-the-Edges** multilingual support is built for the next billion users.

---

## Setup & running locally

No proprietary API keys required. Everything runs on your machine.

### Prerequisites

1. Install [Ollama](https://ollama.com/) and start the server (defaults to `http://127.0.0.1:11434`).
2. Pull the two required models:
   ```bash
   ollama pull llama3
   ollama pull nomic-embed-text
   ```

### Run the app

```bash
npm install
npm run dev
```

This boots the Express API and the Vite frontend together. Open **http://localhost:3000**.

---

## Architecture

- **Backend:** Node.js + Express
- **Frontend:** React + Vite
- **AI integration:** isolated in `src/services/ai.ts`, which makes direct HTTP calls to the local Ollama instance on port `11434` — kept in one module so it's easy to verify no cloud AI calls exist anywhere else in the codebase, and easy to extend later.
- **Vector index:** built in-memory from `data/schemes/*.md` on backend startup.

```
setu/
├── data/schemes/*.md       # Source-of-truth scheme documents (RAG grounding)
├── src/services/ai.ts      # All Ollama calls — generation + embeddings
├── src/...                 # React frontend
└── server/...              # Express API
```

