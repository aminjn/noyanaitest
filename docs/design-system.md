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

## Public site (2026-10 redesign)
The public pages share one scale, all in `app/globals.css`:
- Spacing `--sp1..9` (4px base), `--gutter` (page side padding), `--sectionGap` (between home sections), `--headerH`.
- Type `--fsDisplay`, `--fsH1`, `--fsH2`, `--fsH3`, `--fsLead`, `--fsBody`, `--fsSm`, `--fsXs`, with `--lhTight` / `--lhBody`. Text roles `--textStrong`, `--textBody`, `--textMuted` all pass AA.
- Elevation `--elev1..3`; cards use `--cardBg`, `--cardLine`, `--cardLineHover` (every public `*Card.module.css` uses them).
- Icon tiles: `tone-indigo|violet|teal|amber|rose|sky` (global classes over the `--tone*` tokens).
- Frosted menus: the `.glassMenu` class (`--menuGlass`, `--menuEdge`, `--menuShadow`, `--menuBlur`). Header bar: `--headerGlass`. Without `backdrop-filter` both fall back to a solid surface (`--menuGlassSolid`, `--headerGlassSolid`).
- One highlighted phrase: `.gradText`. Motion is turned off under `prefers-reduced-motion`.

Shared pieces:
- `PublicHeader` (sticky glass bar; the glass is on `::before`, so the drawer and sheets inside it stay viewport-fixed), `MegaMenu` (category column + panel, hover/click/keyboard, popular shortcuts when a category has few or no items), `PublicMobileMenu` (glass drawer from the inline-start edge). Categories, icons and descriptions live in `headerCategories.tsx`; the data comes from `useHeaderCategories`.
- `Components/UI/SectionHeader`: eyebrow, title, description and a "see all" pill. Use it for every public section heading.
- `Button` modes `Light` (white solid on a coloured band) and `Glass` (frosted second action on a band).
- Never show a lone "nothing found": hide the empty block or offer real shortcuts (`popularLinks` in `MegaMenu`). Never boast tiny counts: `HomeRegister` shows a stat only from 50 up, and value props otherwise.
- Phone tab bar: `Components/Layout/BottomNav` (public layout and patient dashboard, up to 768px). It sets `body.hasBottomNav`; anything fixed at the bottom adds `var(--bottomNavSpace)` (the Copilot button, the install sheet, the footer padding).
- PWA: `public/service-worker.js` is the only worker (push, immutable build files, `/offline`); never cache `/api`, `/files` or pages there. The install sheet and its "install app" entries use `Components/Pwa/usePwaInstall`.
