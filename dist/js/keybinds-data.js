// data only — rendering lives in keybinds.js
// Source of truth: PM-SPEC.md section 6 (real config binds win over generic defaults).
// Loaded as a plain <script> global — NOT an ES module — so the static-rendered
// table in keybinds.html and the JS filter share this single source.
// If you edit this file, the static table in keybinds.html must be updated to match.

const KEYBINDS = [
  // ── Window Management ──────────────────────────────────────────────
  { bind: "Super + W",                  description: "Close the focused window",                          category: "Window Management" },
  { bind: "ALT + Tab",                  description: "Cycle focus through open windows",                  category: "Window Management" },
  { bind: "Super + Mouse Drag",         description: "Move a window by dragging it",                      category: "Window Management" },
  { bind: "Super + Right Mouse Drag",   description: "Resize a window by dragging its edge",              category: "Window Management" },
  { bind: "Super + Arrow Keys",         description: "Move focus to the window in that direction",        category: "Window Management" },
  { bind: "Super + Shift + Arrow Keys", description: "Swap the focused window with its neighbor",         category: "Window Management" },
  { bind: "Shift + F11",                description: "Toggle fullscreen for the focused window",          category: "Window Management" },
  { bind: "Super + Shift + V",          description: "Toggle floating mode for the focused window",       category: "Window Management" },
  { bind: "Super + P",                  description: "Toggle pseudo-tiling for the focused window",       category: "Window Management" },

  // ── Workspace Navigation ───────────────────────────────────────────
  { bind: "Super + 1–9",                description: "Switch to workspace 1 through 9",                   category: "Workspace Navigation" },
  { bind: "Super + 0",                  description: "Switch to workspace 10",                            category: "Workspace Navigation" },
  { bind: "Super + Shift + 1–9",        description: "Move the focused window to workspace 1 through 9",  category: "Workspace Navigation" },
  { bind: "Super + Shift + 0",          description: "Move the focused window to workspace 10",           category: "Workspace Navigation" },
  { bind: "Super + Tab",                description: "Cycle to the next workspace",                       category: "Workspace Navigation" },
  { bind: "Super + Shift + Tab",        description: "Cycle to the previous workspace",                   category: "Workspace Navigation" },
  { bind: "Super + Mouse Wheel",        description: "Scroll through workspaces",                         category: "Workspace Navigation" },

  // ── Application Launchers ──────────────────────────────────────────
  { bind: "Super + T",                  description: "Open a terminal (kitty)",                           category: "Application Launchers" },
  { bind: "Super + B",                  description: "Open the web browser (Floorp)",                     category: "Application Launchers" },
  { bind: "Super + F",                  description: "Open the file manager (Nautilus)",                  category: "Application Launchers" },
  { bind: "Super + Space",              description: "Open the Noctalia application launcher",            category: "Application Launchers" },
  { bind: "Super + M",                  description: "Open the music player (Plexamp)",                   category: "Application Launchers" },

  // ── System Controls ────────────────────────────────────────────────
  { bind: "Super + L",                  description: "Lock the screen (hyprlock)",                        category: "System Controls" },
  { bind: "Brightness Up Key",          description: "Raise the screen brightness",                       category: "System Controls" },
  { bind: "Brightness Down Key",        description: "Lower the screen brightness",                       category: "System Controls" },

  // ── Screenshot / Recording ─────────────────────────────────────────
  { bind: "Print",                      description: "Capture a screenshot of a selected region (grimblast)", category: "Screenshot / Recording" },
  { bind: "Super + Print",              description: "Capture a screenshot of the full screen (grimblast)",   category: "Screenshot / Recording" },
  { bind: "Super + Shift + Print",      description: "Capture a screenshot of the active window (grimblast)", category: "Screenshot / Recording" },

  // ── Media Controls ─────────────────────────────────────────────────
  { bind: "Volume Up Key",              description: "Raise the system volume",                           category: "Media Controls" },
  { bind: "Volume Down Key",            description: "Lower the system volume",                           category: "Media Controls" },
  { bind: "Mute Key",                   description: "Mute or unmute the system audio",                   category: "Media Controls" },
  { bind: "Play / Pause Key",           description: "Play or pause the current media",                   category: "Media Controls" },
  { bind: "Next Track Key",             description: "Skip to the next track",                            category: "Media Controls" },
  { bind: "Previous Track Key",         description: "Go back to the previous track",                     category: "Media Controls" },

  // ── Hyprland Session ───────────────────────────────────────────────
  { bind: "Super + Ctrl + R",           description: "Reload the Noctalia shell",                         category: "Hyprland Session" },
  { bind: "Super + Escape",             description: "Open the session and power menu",                   category: "Hyprland Session" },
  { bind: "Super + Shift + E",          description: "Exit the Hyprland session",                         category: "Hyprland Session" }
];
