# TaskFlow // Premium Task Management Dashboard

TaskFlow is a modern, responsive, and interactive To-Do List web application designed to help users organize, prioritize, and execute their day-to-day operations. This project was developed as a high-fidelity frontend developer internship submission for **WeIntern**, showcasing DOM manipulation, state persistence, clean UI design, modular code structure, and responsive design layouts.

---

## 🚀 Live Demo & Visuals

- **Aesthetic**: Premium glassmorphism overlay style.
- **Dynamic Theming**: Full dark mode support that automatically responds to OS preferences or manual override.
- **Animations**: Soft custom keyframe transitions on task insertion, filter changes, and deletion.

---

## ✨ Features Implemented

1. **Add Tasks**: Seamless insertion of tasks up to 100 characters. Auto-focus on initialization.
2. **Edit Tasks**: Inline edit functionality to modify existing entries. Includes keyboard mappings (Enter to Save, Escape to Cancel).
3. **Delete Tasks**: Animate-out list rows after confirmation.
4. **Mark Completed**: Smooth strike-through transitions, disabled editing status on checked items.
5. **Validation Safety**: Prevent empty or whitespace-only submissions using custom, visual validation feedback (with modern alert prompts).
6. **Task Metadata**: Creation timestamp stamps showing date and time formatted locally.
7. **Local Storage Sync**: Automatic state serialization so tasks and user color themes persist across browser sessions and refreshes.
8. **Live Search**: Real-time filtering matching task text. Includes clear-utility icon button.
9. **Filtering Tabs**: Dynamic tabs switching lists view between `All`, `Pending`, and `Completed`.
10. **Progress Analytics**: A visually rich dashboard display showing completion rates, total tasks, completed counts, and pending task stats.
11. **Clear All**: Reset functionality to clear entire workspace after double-verification overlay confirmations.
12. **Custom Modals**: Replaced system default native `confirm()` alerts with custom glassmorphism modal panels to preserve visual styling.
13. **Responsive Grid & Flex**: Built from scratch using fluid HSL styling and media boundaries, optimized across Mobile, Tablet, and Desktop screen widths.

---

## 🛠️ Project Structure

```text
todo-list/
├── index.html     # Semantic layout markup and head definitions
├── style.css      # Core design tokens, theme attributes, and keyframes
├── script.js     # Modular logic controller and DOM paint loop
└── README.md      # Project documentation
```

---

## 💻 Tech Stack & Design Choices

- **HTML5**: Leveraged semantic markup tags (`<header>`, `<main>`, `<section>`, `<label>`, `<footer>`) to optimize SEO structure and screen-reader accessibility.
- **CSS3 Grid & Flexbox**: Designed alignment grids for the analytics layout and flexboxes for form utilities and task rows. No heavy layout frameworks are used, allowing maximum styling control.
- **HSL Theme Engine**: Colors are calculated relative to hue, saturation, and lightness channels, allowing light/dark mode transitions to adjust seamlessly by swapping CSS root variables.
- **Vanilla JavaScript (ES6+)**: Employs clean, modular routines. The DOM rendering runs on a state-driven engine, ensuring elements reflect the state values (`tasks`, `activeFilter`, `searchFilterQuery`) as a single source of truth.

---

## 🔧 Installation & Running Instructions

Since TaskFlow is built on standard web technologies, there are no dependencies to compile or configure:

1. Clone or download this project workspace.
2. Navigate to the `todo-list/` directory.
3. Open `index.html` directly in any web browser (Chrome, Safari, Firefox, Edge).
4. *Alternatively, use a local server runner like Live Server in VS Code to run in a localized port.*

---

## 📝 Modular JavaScript API Guide

The logic in `script.js` is structured into these key functions:

- `addTask(text)`: Validates input, constructs task object with a unique key, and adds it to the front of the list.
- `editTask(id, newText)`: Updates task details inside state and switches rendering state.
- `deleteTask(id)`: Invokes the confirmation modal and executes deletion animation before redrawing.
- `toggleComplete(id)`: Changes task complete status and recalibrates progress meters.
- `saveTasks()`: Stores the current task array in `localStorage`.
- `loadTasks()`: Loads stored tasks, resetting if parsing errors occur.
- `updateStats()`: Computes completion statistics and animates progress bars.
- `filterTasks(filterValue)`: Modifies the active filter (`all` / `pending` / `completed`).
- `searchTasks(query)`: Processes characters to filter matched items in real-time.
