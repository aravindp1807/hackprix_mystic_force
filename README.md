# 📔 Dear Me: The Synthetic Memory Engine ✨

## The Need for a Synthetic Brain

> *We are losing lifetimes of wisdom because memory degrades faster than it can be communicated.*

When a patient enters the later stages of cognitive decline, standard medical care focuses on physical safety — but emotional and cognitive safety are left vulnerable.

### 💭 Cognitive Isolation
Patients need a gentle, patient, and infinite sounding board.

### 📚 Fragmented History
Photos, videos, and journals are scattered across devices — impossible to navigate alone.

### ❤️ Our Mission
**Build a living Synthetic Memory Engine — an Obsidian vault you can talk to through the Dear Me website, growing wiser with every conversation.**

---

**Dear Me** serves as the beautiful, highly interactive frontend for your Synthetic Brain. Built to evoke the comforting nostalgia of a secret childhood journal, it replaces generic note-taking with a heavily themed, emotionally intelligent space. 

From particle animations to specialized data tracking, every feature has been designed to make documenting your journey a magical experience while securely feeding your Synthetic Memory Engine.

---

## 🌟 Comprehensive Feature Breakdown

This application features a global **"My Wisdom"** dashboard that acts as the entry point to **9 completely distinct diary sections**. Each section is tailored specific to the type of memory it holds, complete with unique CSS styling, animations, and custom fields.

### 1. 🔐 Interactive Landing Page
- **The Diary Cover:** The app loads on a beautiful, textured diary cover.
- **Micro-interactions:** A heartbeat-animated lock (`🔒`) responds with a shaking interaction on hover. Clicking it triggers an unlock animation (`🔓`) and a 3D page-turning transition into the app.
- **Ambient Canvas:** The background features gently floating doodles (stars, butterflies, clips) and a 'slow' particle system to immediately establish the scrapbook aesthetic.

### 2. 👭 Friends Journal
A dedicated space to honor the people who color your world.
- **Visuals:** Entries render as tilted Polaroid photos pinned on a board with pink Washi tape.
- **Custom Fields:** Track their name, nickname, photo, the story of your first meeting, their unique personality traits/quirks, what you love about them, funny shared moments, and the life lessons they've taught you.

### 3. 📍 Places & Memories
A travel diary for the specific locations that hold pieces of your heart.
- **Visuals:** Styled like a travel map or postcard. Blue and mint gradients with floating flower particles.
- **Custom Fields:** Upload a photo, pin the location name, write the overarching story, detail the specific emotions you felt there, and log unforgettable micro-moments.

### 4. ❤️ Relationships
Chapters of the heart, written with love.
- **Visuals:** A soft, private diary aesthetic styled with romantic peach and pink linear gradients and floating heart particles.
- **Custom Fields:** Document the story of how you first met, your most beautiful shared memories, the things the relationship taught you, and dedicated space for unfiltered feelings.

### 5. 🌧️ Sad Memories
A uniquely designed safe space for healing on difficult days.
- **Visuals:** Features a custom CSS **Raindrop Animation** covering the screen. The color palette shifts to moody lavender and muted blues.
- **The Healing Journey:** The form asks what happened, what you learned, and how you grew.
- **Growth Visualization:** Viewing an entry triggers a beautiful, timed animation: `🌱 → 🌿 → 🌸`, visually reinforcing that every storm helps you grow.

### 6. 🌱 Life Lessons
Wisdom gathered along the trajectory of your life.
- **Visuals:** Designed to mimic pressed flowers inside a journal. Features a tagging mechanism to label the source of the wisdom.
- **Feature Specifics:** Includes custom category tags (e.g., *Personal Growth, Career, Self-Love*). 
- **Highlighted Realizations:** Your "Key Realization" (the *Aha!* moment) is automatically formatted into a beautifully highlighted, enlarged blockquote.

### 7. 🏆 Happy Moments
A section to celebrate victories, milestones, and proud achievements.
- **Visuals:** Gold and peach color theming with a fast-paced **Confetti Celebration** particle system.
- **Achievement Timeline:** Once you have multiple entries, a specialized UI auto-generates a vertical *Achievement Timeline* at the top of the page, mapping out your victories chronologically.

### 8. 🌟 Bucket List
A dreamy checklist to log aspirations and track life experiences.
- **Interactive UI:** Features custom animated checkboxes that trigger a bounce effect when clicked. Completed items dynamically strike themselves out.
- **Progress Tracking:** Includes a real-time progress bar. As your completion percentage increases, the bar fills with a gradient. Once you pass certain milestones, a twinkling star appears on the progress indicator.
- **Filtering:** Tabbed filtering allows you to immediately sort between "Active" dreams and "Achieved" dreams.

### 9. 🗓️ Important Dates
A ledger for the days that changed everything.
- **Visuals:** Uses a celebratory star particle system and a warm peach gradient.
- **Custom Fields:** Log the name of the event, the deep emotional importance behind it, and the specific traditions or ways you want to remember/celebrate it every year.

### 10. 📜 Philosophy
A repository for your inner wisdom, life codes, and late-night reflections.
- **Visuals:** "Dreamy" particle animations with a soft cream, parchment-like aesthetic to mimic ancient scrolls and deep thoughts.
- **Quote Display:** Your personal quotes and core thoughts are extracted and centered in a large, elegant, handwritten font wrapper reminiscent of an author's quote.
- **Custom Fields:** Includes the situation/context that inspired the thought, the experience it relates to, and the ultimate takeaway, categorizable by themes like *Observation* or *Inner Peace*.

---

## ⚙️ Core Technical Features

Under the hood, *Dear Me* leverages extensive modern web features without the overhead of complex backend architectures.

### Pure Local Data Security (`localStorage`)
Because a diary is incredibly private, **no data ever leaves the user's device**. 
- A custom wrapper around the browser's `localStorage` API handles full CRUD (Create, Read, Update, Delete) operations.
- **Base64 Photo Storage:** When users upload an image to an entry, the application uses the browser's `FileReader` API to parse the binary file into a Base64 string, allowing image persistence directly within local client storage.

### Global Search Engine
The Dashboard features a smart magnifying glass search bar. Driving this is a custom fuzzy-search algorithm that maps over *all 9 sections simultaneously*, traversing every string of JSON data to instantly instantly pull up matching memories regardless of which chapter they were written in.

### "Midnight Diary" Light / Dark Mode Toggle
A fully fleshed out CSS-variable based theme switching architecture.
- Toggling the navigation bar icon seamlessly transitions all hundreds of CSS tokens.
- **Midnight Diary Mode** replaces the pastel pinks and creams with moody, deep space purples, dark blues, and soft moonlit contrast colors, perfect for late-night journaling. Theme preference is automatically saved to memory.

### Complex Animation Engine (Vanilla CSS)
Relying entirely on high-performance CSS instead of heavy JS libraries, the app includes:
- Multi-phase keyframe animations for floating elements, spinning load states, and pulsing components.
- Staggered entrance animations (using CSS `nth-child` delay calculations) so that grids of memories cascade into view beautifully.
- Custom particle generation (Hearts, Rain, Confetti, Stars) mapped to hardware-accelerated transforms.

---

## 🚀 Getting Started

This application is built with **React** and **Vite** as a Single Page Application (SPA).

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

1. **Clone or Download** this repository.
2. Open your terminal in the project directory.
3. Install the dependencies:
   ```bash
   npm install
   ```

### Running Locally

To start the development server, run:
```bash
npm run dev
```
The terminal will display a local link (usually `http://localhost:5173/`). Open this link in your browser to start writing in your diary!

---

*“To write is to keep a piece of time forever.”* ✨
