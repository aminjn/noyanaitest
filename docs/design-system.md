# NoyanAI design system: Aurora

This is the visual language of the whole project (panels and public site). It's the "A" direction chosen on the design canvas: a soft colour mesh, frosted-glass surfaces, an indigo-to-blue accent, and a violet colour that marks everything the AI does.

## Theme: light and dark
- `app/globals.css` defines every token twice: `:root` holds the light values and `html[data-theme="dark"]` holds the dark ones.
- An inline script in `app/layout.tsx` sets `data-theme` before first paint:
  - the saved choice first (`localStorage["noyan-theme"]`),
  - otherwise the OS preference.
- The switch is `Components/UI/Theme/ThemeToggle.tsx`. Use `compact` in tight headers.
- Never hardcode a colour that must change with the theme. Use a token:
  - `--white` is the solid surface, not "white". It turns dark in dark mode.
  - `--black` is the strong text colour.
  - `--gray1..13` go from background (1) to text (13).
- Text or icons on a coloured fill use `--onColor`, which is always white.
- An always-dark surface (call rooms, video) uses `--ink`.
- A deep brand band (footer, CTA strip) uses `--brandDeep`.

## Surfaces
| Token | Use |
|---|---|
| `--meshBase` + `--mesh` | page background of panels (`background-color` + `background-image`) |
| `--glass`, `--glassStrong`, `--glassLine`, `--glassShadow`, `--glassBlur` | cards, sidebar, top bar (`.glass` in globals.css) |
| `--line` | hairlines on glass |
| `--radiusLg` / `--radiusMd` / `--radiusSm` | 28 / 20 / 14px |

## Accent and AI
- Primary action:
  - `background-color: var(--gradAccentSolid); background-image: var(--gradAccent)`
  - `Button` Primary Fill already does this.
- AI:
  - Colours: `--ai`, `--aiText`, `--aiSoft`, `--aiLine`.
  - Mark: `Components/Icons/SparkIcon`.
  - Avatar: `Components/UI/AiOrb`.
- Rules for AI features:
  - Every AI suggestion is a draft or a link. Nothing runs without the user's approval, and the UI says so.
  - Suggestions come from real data and are explained ("2 missed visits before"). Never show a made-up probability.

## Shared components
They already follow Aurora; improve them instead of adding one-off styles:
- `PanelLayout`, `PanelSidebar`, `AdminSidebar`
- `Table` (the ag-grid theme uses the CSS variables)
- `Box`, `WithTitle`, `PopupCard`, `ClientTabSystem`, `Button`, `Input`
