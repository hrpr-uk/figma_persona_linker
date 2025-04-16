# Persona Linker – Figma Plugin

A lightweight development plugin for linking personas directly to frames, components, and instances in Figma. Keeps your design aligned with real users – inside the tool you already work in.

---

## ✨ What it does

- Create and edit personas with emoji or coloured avatar initials  
- Link one or more personas to selected elements  
- Highlight all elements linked to a selected persona  
- Import/export personas and linked frame data  
- Search and filter personas in the UI  

---

## 🚧 This is a work in progress

The plugin is not yet published on the Figma Community. To try it out, you’ll need to run it as a **local development plugin** using the steps below.

---

## 🛠 Getting started

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/persona-linker.git
cd persona-linker
npm install
```

### 2. Build or run in development mode

```bash
npm run dev       # for local dev
npm run build     # to generate production-ready /dist files
```

### 3. Load into Figma

- Open the **Figma desktop app**
- Go to `Menu → Plugins → Development → Import plugin from manifest…`
- Navigate to the plugin folder and select the `manifest.json` file

You’ll now see the plugin listed under `Plugins → Development → Persona Linker`.

---

## 🧪 Current features

- ✅ Persona creation, editing and deletion  
- ✅ Link/unlink multiple personas to frames, components, instances  
- ✅ Visual highlights for linked elements (where supported)  
- ✅ Import personas from `.json`  
- ✅ Export frame–persona links as `.json` or `.csv`  
- ✅ Search and filter personas in the UI  
- ✅ Colour avatar initials fallback when no emoji  

---

## 📁 Sample persona data

Click **“Download sample persona.json”** in the plugin or use:

```json
[
  {
    "id": "alex-admin",
    "name": "Alex",
    "role": "Admin",
    "emoji": "🧑‍💼",
    "avatarColor": "#FFD580",
    "description": "Manages content and user permissions",
    "tags": ["internal", "B2B"]
  }
]
```

---

## 🧩 Built with

- Figma Plugin API  
- TypeScript  
- figma-plugin-ds (local CSS version)

---

## 📄 License

MIT – use it, modify it, extend it.

---

## 📝 Blog

Read more about the design thinking behind the plugin:  
**[Blog post → coming soon]**

---

## 🧠 Created by [hrpr](https://www.hrpr.co.uk)

We build digital products, services and tools – and occasionally plugins like this – to make our work (and yours) easier, clearer, and more user-centred.
