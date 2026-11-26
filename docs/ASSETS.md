# Placeholder assets (swap before launch)

Banks's instruction (2026-11-25): CCT art may be used as placeholders while Champzz is private. Some pieces are Banks's originals, some came from Pinterest. **Every file in `public/placeholders/` must be replaced with original or licensed art before real families or clubs see the site.** Finding them all: `grep -rn "placeholders/" src`.

Rules applied when picking:
- Nothing MFM: no logos, seals, church building or pastor photos.
- No photos of real children (CCT's `hero-kids`, `hero-quiz`, `hero-teachers` and `classroom-bible-reading-bg` were left out).
- No art that imitates a known film studio's characters.

| File | From CCT |
|---|---|
| quiz.webp | feature-quiz.png |
| trophy.webp | feature-leaderboard.png |
| rocket.webp | feature-rocket.png |
| robot-coins.webp | feature-achievements.png |
| book.webp | feature-bible.png |
| class.webp | feature-class.png |
| flame.webp | icons/streak-flame.png |
| bible.webp | icons/bible-journey-book.png |
| heart-tree.webp | village/ears-hearttree.png |
| champ-card.webp | village/profile-card.png |
| house.webp | village/home-brickbuilding.png |
| school.webp | village/class-house1.png |
| cabin.webp | village/messages-teacherhome.png |
| game-rocket.webp | village/game-rocket.png |
| teacher.webp | teacher-isometric.png |
| open-bible.webp | hero-bible.jpg |
| scene-david.webp, scene-noah.webp, scene-daniel.webp, scene-moses.webp | scenes/*.jpg |

All converted to WebP at 240 to 640 px (about 365 KB in total) so slow networks are not punished.

## Landing v2 (2026-11-26)

The landing page (`src/features/marketing/landing-v2/`) is ported from the Claude Design file "Champzz Landing v2".

- `public/landing/`: the crew art made for Champzz (Daye, Conor, Ellie, the group cutout, leader, teacher, parents). Converted to WebP; the four full-bleed scenes went from about 2.5 MB each to under 150 KB.
- `public/placeholders/landing/`: CCT art the design reuses (village buildings, feature icons, Bible scenes, book covers, the Champ Town map). Same rule as above: replace before launch.

Flag before launch: `public/landing/teacher.webp` carries a visible creator watermark from its source. Replace it or license it.
