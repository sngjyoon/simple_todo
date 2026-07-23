# simple_todo

A simple, minimalist, aesthetic weekly todo planner — inspired by the design and layout of [tweek.so](https://tweek.so).

## Layout

A **6 × 2 grid**:

- **Row 1** — six columns. Monday through Friday each get their own column; **Saturday and Sunday are stacked** together in the sixth column.
- **Row 2** — a full-width **Someday** list for undated tasks.

Today's column is highlighted in indigo.

## Features

- **Add** — click "+ Add task" under any day and press Enter (Enter again to keep adding).
- **Edit** — click a task's text to edit inline; Enter to save, Esc to cancel.
- **Complete** — click the circle on the left of a task to toggle done (strikethrough).
- **Delete** — hover a task and click the trash icon.
- **Color labels** — hover a task, click the palette icon, and pick a highlight color.
- **Navigate weeks** — arrow buttons (or ← / → keys); "Today" jumps back to the current week.
- **Persistence** — everything is saved to your browser's `localStorage`. No account, no backend.

## Run locally

It's a static site — just open `index.html`, or serve the folder:

```bash
python3 -m http.server 5501
```

Then visit http://localhost:5501.

## Files

- `index.html` — markup
- `styles.css` — styling
- `app.js` — app logic (state, rendering, persistence)
