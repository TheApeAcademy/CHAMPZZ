# Champzz design system (locked 2026-11-25)

Direction **D, Champ Mix**, chosen by Banks. Canvas with every board: https://claude.ai/artifact/LzL13VEGUEnh1Jqs4b6AMT (private to Banks).

## Logo

- Updated 2026-11-27 to the Claude Design language: the hand-signed **Champzz** wordmark in Mr Dafoe (Night Ink, or Warm Cream on dark) with the Trophy Gold swash and four-point star underneath (`src/components/ui/logo.tsx`, `BRAND_WORD`). It always reads as the brand name.
- App icon and favicon: a cream script "C" with the gold swash on a Night Ink tile (`src/app/icon.png`, `favicon.ico`, `apple-icon.png`, `public/icons/*`). Share image: `public/og.jpg`.
- Fonts are self-hosted from `src/app/fonts` (no Google Fonts requests from kids' devices).

## Claude Design screens (2026-11-27)

Ported from the "Mobile-first design scoping" Claude Design project: Accounts (`/login`, `/login?kid=1`, `/signup`, `/forgot-password`, `/reset-password`, `/onboarding`, `/join/*`), Champ Town sign-in (`/k/[org]`), the Village home (`/k/[org]/home`), Champ Arena (`/k/[org]/games`), Sunday School (`/k/[org]/sunday`), the 3D Champ Town (`/k/[org]/town`, faith clubs, three.js loads only on that page), Clubhouse (`/c/[org]`) and Staff HQ (`/o/[org]` plus the phone tab bar). Every other page picks up the language through the shared primitives and shells. Not ported yet: the 3D Bible Heroes collection (needs unlock rules decided).

## Champ vs Champzz

- **Champzz** is the product, the company and the brand: page titles, emails, legal pages, "Built with Champzz".
- **champ** means a kid: "Hi, Champ!", Road to Champ, Champ Points, Hall of Champs, My Champ, Champ Card, Champ Town, Little Champs.

## Colour tokens

| Token | Hex | Use |
|---|---|---|
| `--brand` | `#2F5BFF` Electric Blue | primary actions, active nav, the kid hero card. **Replaced by the org's colour when white-labelled.** |
| `--gold` | `#F2B33D` Trophy Gold | logo bolts, Champ Points, wins, levels, missions |
| `--coral` | `#FF5A3C` Hot Coral | Fire Streak, urgent counts (Talk to Someone) |
| `--ink` | `#0B1026` Night Ink | text, dark surfaces, kid nav bar |
| `--cream` | `#FFF8EC` Warm Cream | page ground |
| `--surface` | `#FFFFFF` | cards |
| `--line` | `#E6DCC6` | borders |
| `--muted` | `#4D5172` | secondary text (passes 4.5:1 on cream and white) |

Text on gold and coral is always Night Ink. Text on Electric Blue is white. Gold, coral and ink never change with white-labelling, so wins always look like Champzz. Org colours are checked for contrast on save, and a dark or light text colour is picked automatically.

## Type

- Display: **Archivo** 800 upright for admin headings, 900 italic UPPERCASE for kid-facing titles (ROAD TO CHAMP).
- Body: **Nunito Sans** 400 to 800.
- Self-hosted through `next/font`, Latin subset. No other families.

## Shape and spacing

- Radius: 14px controls, 20px cards, 24 to 28px kid tiles, pills for chips.
- 8px spacing grid. Touch targets at least 44px (56px kid nav, 64px in Little Champs).

## Age modes

Each class has an age band that picks the kid skin:

- **Champ** (ages 9 to 14): flat tiles, italic display type, 2x2 feature grid.
- **Little Champs** (ages 4 to 8): three giant stacked buttons (Play, Story, Trophies), 3px Night Ink outlines with 5px offset shadows, stars instead of numbers, icon-only nav with a Listen button, minimal reading.

Same logo, colours and Champ Points in both. Admin and parent screens never use outlines or italic display type: calm, cream ground, white cards, B-style sidebar.

## Rules

- No emoji as icons. Stroke icons, 2.2 to 2.4px.
- No gradients as decoration.
- All art is original. No characters from existing shows or brands.
- Safeguarding UI (Talk to Someone) stays plain and calm, never gamified.
