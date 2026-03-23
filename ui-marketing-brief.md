# PriceRadar — UI Marketing Brief
**For AI generating marketing assets: posts, banners, ads, carousels, mockups**

This document contains the exact, accurate UI of the PriceRadar app as it is built today. Use only the values, colors, fonts, and copy in this file. Do not invent or assume anything.

---

## 1. What the App Does

Paste any Amazon product URL → see the full price history, a verdict on whether today's price is a 6-month low/high/average, and a live comparison against other retailers.

**Core question it answers:** *"Is this price actually a good deal right now?"*

**Who it's for:** US shoppers on mobile who buy on Amazon and want to know if now is the right moment to buy.

---

## 2. The Visual Aesthetic

**Reference:** ElevenLabs.io. If you know that product, PriceRadar's UI feels like that — obsidian dark, clean white type, barely-there glass surfaces, surgical precision.

| Property | Description |
|---|---|
| **Mood** | Dark, calm, precise, premium — like a financial terminal made beautiful |
| **Background** | Near-black zinc — `#09090B` |
| **Cards / surfaces** | Zinc-900 glass — `rgba(24, 24, 27, 0.80)` — almost invisible borders |
| **Text** | Near-white — `#FAFAFA` |
| **Secondary text** | Zinc-400 — `#A1A1AA` |
| **Primary CTA color** | **White** — the only bright element besides signal colors |
| **Accent color** | None — the system is deliberately monochromatic. White is the action color. |
| **Signal colors** | Emerald green + red — the ONLY saturated colors in the entire UI |
| **Font** | Plus Jakarta Sans — for everything (headings, body, labels, buttons) |
| **Price font** | JetBrains Mono — monospace, tabular, precise |
| **Texture** | Subtle noise grain over the whole screen at 3.5% opacity |
| **Glass blur** | `backdrop-filter: blur(20px)` on all elevated surfaces |

**Three words that describe it:** dark · monochromatic · surgical

**What it is NOT:**
- Not colorful (no brand accent color — white is it)
- Not navy blue or dark blue (it's zinc — almost pure black with a barely-perceptible warm tint)
- Not cyan or blue-accented
- Not playful or startup-bright
- Not light mode — ever

---

## 3. Exact Color Values

Use these exact hex/rgba values in any mockup. Never substitute or approximate.

### Base Palette

| Role | Value | Description |
|---|---|---|
| Background | `#09090B` | Near-black — zinc-950 |
| Surface (cards) | `#18181B` | Zinc-900 |
| Surface elevated (dropdowns) | `#27272A` | Zinc-800 |
| Foreground (text) | `#FAFAFA` | Near-white |
| Secondary text | `#A1A1AA` | Zinc-400 — muted labels |
| Primary CTA | `#FFFFFF` | White buttons |
| CTA text (on white) | `#111113` | Near-black |

### Borders & Glass

| Role | Value |
|---|---|
| Card border | `rgba(255, 255, 255, 0.06)` — nearly invisible |
| Hover border | `rgba(255, 255, 255, 0.12)` |
| Card background | `rgba(24, 24, 27, 0.80)` |
| Glass background (header/modals) | `rgba(9, 9, 11, 0.85)` |
| Glass border | `rgba(255, 255, 255, 0.06)` |
| Bottom nav background | `rgba(24, 24, 27, 0.90)` |
| Bottom nav border | `rgba(255, 255, 255, 0.08)` |

### Signal Colors — The Only Saturated Colors in the App

| Signal | Hex | Background tint | Border |
|---|---|---|---|
| **Price Low** (green) | `#10B981` | `rgba(16,185,129,0.10)` | `rgba(16,185,129,0.25)` |
| **Price High** (red) | `#EF4444` | `rgba(239,68,68,0.10)` | `rgba(239,68,68,0.25)` |
| **Average Price** (neutral) | `#A1A1AA` | `rgba(161,161,170,0.08)` | `rgba(161,161,170,0.18)` |

**These signal colors are the visual heartbeat of the app.** Everything else is black, zinc, and white. The moment you see green or red, that's the verdict.

---

## 4. Typography

**One font family for everything:** Plus Jakarta Sans — loaded from Google Fonts.

```
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&...')
```

| Use | Font | Weight | Color |
|---|---|---|---|
| Hero headline | Plus Jakarta Sans | 700 | `#FAFAFA` |
| Section titles | Plus Jakarta Sans | 600 | `#FAFAFA` |
| Body / descriptions | Plus Jakarta Sans | 400 | `#FAFAFA` |
| Labels / secondary | Plus Jakarta Sans | 500 | `#A1A1AA` |
| Button labels | Plus Jakarta Sans | 600 | `#111113` on white / `#FAFAFA` on dark |
| **Price values** | **JetBrains Mono** | **500–700** | `#FAFAFA` |
| Signal badge label | Plus Jakarta Sans | 600 | signal color |

**Prices always use JetBrains Mono** — monospace, tabular numerals, prevents layout shift. Example: `$279.99` in JetBrains Mono bold.

Base `html` font-size is `14px`. All inputs/buttons are `16px` to prevent iOS zoom.

---

## 5. The Three Signal States

The signal badge is the app's entire value proposition in one element. It is always a pill/badge with an icon, a label, and subtext.

### 🟢 Price Low
- **What it means:** Today's price is historically low — good time to buy
- **Badge color:** Emerald `#10B981`
- **Background:** `rgba(16,185,129,0.10)` — faint green glow
- **Border:** `rgba(16,185,129,0.25)`
- **Icon:** Trending down arrow ↘
- **Label (exact):** `Price Low`
- **Subtext examples:** `90-day low · 22% below peak` / `6-month low`
- **Emotional register:** Positive, green light, act now

### 🔴 Price High
- **What it means:** Today's price is historically high — consider waiting
- **Badge color:** Red `#EF4444`
- **Background:** `rgba(239,68,68,0.10)` — faint red glow
- **Border:** `rgba(239,68,68,0.25)`
- **Icon:** Trending up arrow ↗
- **Label (exact):** `Price High`
- **Subtext examples:** `Above 6-month average` / `Near 90-day peak`
- **Emotional register:** Caution, pause, wait it out

### ⚪ Average Price
- **What it means:** Today's price is near the historical average
- **Badge color:** Zinc `#A1A1AA`
- **Background:** `rgba(161,161,170,0.08)` — barely-there grey
- **Border:** `rgba(161,161,170,0.18)`
- **Icon:** Horizontal minus —
- **Label (exact):** `Average Price`
- **Subtext examples:** `In line with 90-day average`
- **Emotional register:** Neutral, informational, no urgency

**On the product result page, the badge is displayed at hero size** — large, centered, with the current best price displayed directly below it.

---

## 6. Every Screen Described

### Screen 1 — Landing / Home

**Background:** `#09090B` near-black, animated slow-floating radial glow blobs (very subtle blue/white) behind content, noise grain over everything.

**Header:** PriceRadar logo — Radar icon in a small square with faint blue glow (`rgba(59,130,246,0.20)`) + "Price" in white + "Radar" in blue-400 (`#60A5FA`) — both in Plus Jakarta Sans 700.

**Hero:**
- Small pill badge: `Amazon price intelligence` with a tiny pulsing green dot
- H1: **"Is this price actually a good deal?"** — Plus Jakarta Sans 700, white, very large
- Subtext: *"Paste any Amazon link — we'll show full price history and compare retailers instantly."* — Plus Jakarta Sans, zinc-400

**Search bar:**
- Large rounded input, zinc-900 background, border `rgba(255,255,255,0.06)`
- Placeholder: *"Paste Amazon product URL…"*
- On focus: border becomes `rgba(255,255,255,0.18)` — slightly brighter

**Sample product card** (below the search bar):
- Glass card: `rgba(24,24,27,0.80)` background, barely-visible white border
- Shows: Sony WH-1000XM5 headphones image
- **Green "Price Low" badge** — the first saturated color the user sees
- Price: `$279.99` in JetBrains Mono
- Subtext: `90-day low · 22% below peak`

**"How it works" — 3 steps:**
1. *Paste an Amazon product link*
2. *Get the verdict instantly*
3. *Set an alert, buy at the right time*

**Trust signals:**
- No browser extension required
- Multi-retailer comparison in one view
- Historical high/low signal — not just today's price
- Free price checks, no account required
- Price alert notifications when your target is hit

---

### Screen 2 — Search Page

**Title:** `Search a product`
**Subtext:** `Paste an Amazon link to see price history and compare retailers`

**"Hot right now" section:**
- Horizontal scroll list of products others are tracking
- Each item: product image thumbnail + name + small signal pill + price
- Feels like: live, social, real-time community

**"Recently checked" section:**
- Swipeable cards (mobile) showing last-checked products
- Each: thumbnail + name + signal pill + price + retailer
- Swipe left → red delete zone appears

**Step-by-step hint for new users:**
1. Find a product on Amazon
2. Copy the URL from your browser's address bar
3. Paste it above — we'll show price history and compare retailers

---

### Screen 3 — Product Result Page

This is the **money screen** — the deepest, most information-dense view.

**Top:**
- Back arrow + *"Updated X minutes ago"* timestamp in zinc-400
- Product image (full width, no padding, `object-cover`)
- Product name in Plus Jakarta Sans 600, white
- Category label in zinc-400

**Hero signal badge (large, centered):**
- Occupies prime visual real estate — center screen, largest element
- Signal pill at 2–3x normal size
- Example: large green pill, "Price Low" in Plus Jakarta Sans 600, emerald-colored
- Subtext below: `90-day low · 22% below peak` in zinc-400
- Best price below that: `$279.99` in JetBrains Mono 700, white, very large
- Retailer: `on Amazon` in zinc-400

**CTA row:**
- Primary: white pill button `Track this product` — white bg, near-black text, Plus Jakarta Sans 600
- Secondary: icon-only button (bell) for alert setup — zinc-900 bg, white icon

**"Prices right now" — comparison table:**

Each row:
- Colored initial circle (first letter of retailer name, e.g. "A" for Amazon) + retailer name
- Price in JetBrains Mono — color-coded to signal (green if best, neutral if higher)
- Delta badge: e.g. `+$20` or `Best price`
- Buy button (white filled) or locked button (Upgrade / Sign in)

Example rows:
```
🟢  Amazon      $279.99    Best price    [Buy →]
⚪  Best Buy    $299.99    +$20.00       [Upgrade]
⚪  Walmart     $319.00    +$39.01       [Upgrade]
```

The best-price row has a subtle background tint matching the signal color.

While loading live retailer data: *"AI searching Walmart, Best Buy & Target…"* with skeleton rows.

**Stats grid — 4 glass boxes:**
```
┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  90d Low     │  │  90d High    │  │  vs. High    │  │  Price rank  │
│  $249.99     │  │  $359.00     │  │    -22%      │  │   18th %     │
└──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘
```
Numbers in JetBrains Mono 700 or Plus Jakarta Sans 700, white. Labels in zinc-400.

**Price history chart:**
- Line chart on dark background
- Range selector pills: 30d / 90d / 180d / 1yr
- Free tier: chart is blurred with a paywall overlay — *"Upgrade to see full price history"*
- Paid tier: full chart visible, current price line highlighted

---

### Screen 4 — Dashboard / Watchlist

**Header:**
- User avatar (initials in zinc-800 circle) + `{Name}'s Watchlist` in Plus Jakarta Sans 600
- Subtext: `3 products tracked`
- Refresh icon button + grid/list view toggle

**Stats strip (when products exist):**
`3 tracked  ·  2 alerts on  ·  1 at low price`
All in zinc-400, monospace numbers

**Filter pills (horizontal scroll):**
`All` | `Price Low` | `Price High` | `Average`
Active pill: white background, near-black text
Inactive pills: zinc-800 background, zinc-400 text — glass outlines

**Product cards (grid view):**
- Zinc-900 glass card with barely-visible white border
- Product image fills top third of card
- Small signal badge in top-right corner of image
- Product name (2 lines max) in Plus Jakarta Sans 500, white
- Price in JetBrains Mono 700, white + retailer in zinc-400
- Bottom row: clock icon + `2 hours ago` + bell icon + trash icon — all zinc-400

**Product row (list view):**
- Thumbnail 48×48px + name (truncated) + signal pill
- Right side: price + retailer + bell icon

**Empty state:**
`Your watchlist is empty.`
`Add products to track their price history and get alerts.`
[Track a Product] — white button

**Upgrade nudge (at free tier limit):**
`Tracking limit reached. Upgrade for unlimited products.`
[Upgrade] — white button

---

### Screen 5 — Bottom Navigation (mobile only)

Floating pill fixed at bottom of screen:
- Shape: `border-radius: 32px` — fully rounded pill
- Background: `rgba(24, 24, 27, 0.90)` — near-opaque zinc-900
- Border: `rgba(255, 255, 255, 0.08)` — barely visible
- Blur: `backdrop-filter: blur(20px)`
- Shadow: `0 4px 24px rgba(0,0,0,0.50)`

4 tabs: **Home · Search · Watchlist · Account**

- Active tab: icon + label in white, thin white underline indicator (animated slide)
- Inactive tab: icon + label in zinc-500 (`#71717A`)
- Tap target: minimum 44×44px each

---

## 7. Real Product Data (use verbatim in mockups)

These are the exact products, prices, and signals from the app. Use only these in any mockup — never invent product data.

### Sony WH-1000XM5 Wireless Headphones ← USE THIS ONE MOST
- Signal: **Price Low** (green)
- Subtext: `90-day low · 22% below peak`
- Amazon: `$279.99` ← best price
- Best Buy: `$299.99` (+$20.00)
- Walmart: `$319.00` (+$39.01)
- 90-day low: `$249.99`
- 90-day high: `$359.00`
- vs. High: `-22%`
- Price rank: `18th percentile`

### Apple AirPods Pro (2nd Gen)
- Signal: **Price High** (red)
- Subtext: `Near 90-day peak`
- Amazon: `$249.00`

### Instant Pot Duo 7-in-1
- Signal: **Average Price** (neutral/zinc)
- Subtext: `In line with 90-day average`
- Amazon: `$89.99`

### LG C3 OLED TV 55"
- Signal: **Price Low** (green)
- Subtext: `6-month low`
- Amazon: `$1,199.00`

---

## 8. Exact UI Copy — Use Verbatim

Never paraphrase these. These are the exact strings from the app.

### Hero
- `Is this price actually a good deal?`
- `Paste any Amazon link — we'll show full price history and compare retailers instantly.`
- `Amazon price intelligence`

### How it works
1. `Paste an Amazon product link`
2. `Get the verdict instantly`
3. `Set an alert, buy at the right time`

### Trust signals
- `No browser extension required — works on any device`
- `Multi-retailer comparison in one view`
- `Historical high/low signal — not just today's price`
- `Free price checks, no account required`
- `Price alert notifications when your target is hit`

### Signal labels — exact casing, always
- `Price Low` — never "Low Price", never "PRICE LOW"
- `Price High` — never "High Price"
- `Average Price` — never "Neutral" or "Average"

### Buttons
- `Check a Price`
- `Track this product`
- `Set an alert`
- `Sign up free`
- `Upgrade`
- `Buy →`

### Onboarding
- `We'll notify you when the price drops to where you want it. You come back, you buy.`
- `Paste any Amazon product URL`

### Empty / error states
- `Your watchlist is empty. Add a product to get started.`
- `Tracking limit reached. Upgrade for unlimited products.`
- `Could not load product. Please try again.`

---

## 9. Component Styles — Exact CSS

### Glass card
```css
background: rgba(24, 24, 27, 0.80);
border: 1px solid rgba(255, 255, 255, 0.06);
box-shadow: 0 1px 3px rgba(0,0,0,0.40), 0 2px 10px rgba(0,0,0,0.25);
border-radius: 12px;
```

### Card hover state
```css
transform: translateY(-2px);
border-color: rgba(255, 255, 255, 0.12);
box-shadow: 0 0 30px -5px rgba(255,255,255,0.08), 0 4px 20px rgba(0,0,0,0.40);
```

### Glass (header / modal)
```css
background: rgba(9, 9, 11, 0.85);
backdrop-filter: blur(20px);
border-bottom: 1px solid rgba(255, 255, 255, 0.06);
box-shadow: 0 8px 32px rgba(0, 0, 0, 0.40);
```

### Bottom nav pill
```css
border-radius: 32px;
background: rgba(24, 24, 27, 0.90);
border: 1px solid rgba(255, 255, 255, 0.08);
box-shadow: 0 4px 24px rgba(0,0,0,0.50), 0 1px 4px rgba(0,0,0,0.30);
backdrop-filter: blur(20px);
```

### Primary button (white)
```css
background: #FFFFFF;
color: #111113;
font-family: Plus Jakarta Sans;
font-weight: 600;
border-radius: 12px;
min-height: 44px;
```

### Search input (default)
```css
background: rgba(255, 255, 255, 0.06);
/* on focus: */
background: rgba(255, 255, 255, 0.18);
/* on error: */
background: rgba(239, 68, 68, 0.40);
```

### Focus ring
```css
outline: 2px solid rgba(255, 255, 255, 0.80);
outline-offset: 2px;
```

---

## 10. Tone & Voice for Posts

The brand voice is: **direct · calm · honest · confident**

| ❌ Don't say | ✅ Say instead |
|---|---|
| "🚨 HUGE DEAL! Don't miss out!!!" | "This price is 22% below its 90-day peak." |
| "Best deal ever on headphones!" | "Sony WH-1000XM5 are at a 90-day low right now." |
| "You NEED this app!" | "Know before you buy." |
| "Amazing free app, try it today!" | "Paste any Amazon link. See the full price history." |
| "Limited time offer!!!" | (never — no manufactured urgency) |
| "Oops! Something went wrong 😬" | "Could not load product. Please try again." |

### Best framing angles for posts

1. **Intelligence** — *"Know if the price is actually good — not just what it is."*
2. **Control** — *"Stop guessing. See the history."*
3. **Timing** — *"Buy at the right time, not just the available time."*
4. **Simplicity** — *"Paste a link. Get the answer."*
5. **Trust** — *"No extension. No account. Just the truth about the price."*

---

## 11. Visual Hierarchy for Marketing Layouts

When composing any asset, this is the order of visual weight — top to bottom:

1. **Signal badge** — largest, most colorful element (green/red pill). This is the hero.
2. **Price** — large, JetBrains Mono, white (`$279.99`)
3. **Savings context** — `90-day low · 22% below peak` in zinc-400
4. **Product name** — medium, Plus Jakarta Sans, white
5. **Retailer comparison rows** — smaller, supporting context
6. **CTA** — white button at the bottom

**The structure of any strong PriceRadar visual:**
```
[black/near-black background]
  [glass card]
    [signal badge — green/red/zinc pill]
    [product name]
    [price in JetBrains Mono]
    [savings subtext in zinc-400]
    [retailer comparison: Amazon $279 · Best Buy $299 · Walmart $319]
  [white CTA button below]
```

---

## 12. Best Marketing Visuals (ranked)

### #1 — Green signal + price on a dark card
Sony WH-1000XM5 · glass card · **green "Price Low" badge** · `$279.99` in JetBrains Mono · subtext `90-day low · 22% below peak`. Background `#09090B`. This is the single most compelling visual in the entire product.

### #2 — The 3-retailer comparison table
Three rows on dark background:
```
A  Amazon     $279.99   Best price    [Buy →]
B  Best Buy   $299.99   +$20.00       [locked]
W  Walmart    $319.00   +$39.01       [locked]
```
Amazon row slightly tinted green. Prices in JetBrains Mono. Shows value prop instantly.

### #3 — The stats grid (4 boxes)
```
$249.99    $359.00    -22%    18th%
90d Low    90d High   vs High  Price rank
```
Dark glass boxes, JetBrains Mono numbers. Great for "data" aesthetic posts.

### #4 — Full product result screenshot (mobile)
Shows the complete experience: signal badge hero → stats grid → comparison table. Best for carousels and "look at this" posts.

### #5 — Dashboard with mixed signals
Watchlist showing 3 products with different signals — one green, one red, one zinc. Stats strip reads `2 alerts on · 1 at low price`. Shows the app working passively for you.

---

## 13. Post Templates

### Carousel: "How it works"
- Slide 1: Black background, white H1: *"Is this price actually a good deal?"*
- Slide 2: URL input screenshot — *"Paste any Amazon link"*
- Slide 3: Green signal badge screenshot — *"Get the verdict instantly"*
- Slide 4: Comparison table screenshot — *"Compare retailers side by side"*
- Slide 5: Alert setup sheet — *"Set an alert. Buy at the right time."*
- Slide 6: Black background, white CTA: *"Free. No extension. No account. priceradar.io"*

### Single post: Green signal moment
**Visual:** Glass card, Sony headphones, big green `Price Low` badge, `$279.99`
**Copy:** *"Sony WH-1000XM5 are currently at a 90-day low on Amazon. Down 22% from peak. PriceRadar shows you this in seconds. priceradar.io"*

### Single post: Data angle
**Visual:** Stats grid — 4 dark boxes with numbers
**Copy:** *"Most people see a price. Not the context. 90-day low: $249.99. Current: $279.99. Price rank: 18th percentile. That's the difference between buying and overpaying."*

### Story / Reel hook
Text on black: *"You're probably paying more than you should for this."*
Cut to: green signal badge on Sony headphones.
CTA: *"priceradar.io — free, no account needed"*

### Comparison post
Left: Generic Amazon product page — just a number
Right: PriceRadar result — signal badge + history context + 3 retailers
**Headline:** *"Same product. More context. Better decision."*

---

## 14. What NOT to Do

These are hard rules. Breaking them makes the asset look off-brand.

| ❌ Wrong | ✅ Why / What to do instead |
|---|---|
| Light / white background | The app is always dark — `#09090B` or very close |
| Cyan or blue as the accent color | There is no cyan accent — white is the action color |
| Using blue gradient highlights on cards | Cards use near-invisible white hairline borders only |
| Inventing product data | Only use the 4 real mock products above |
| Using "Price Low" in all caps or lowercase | Always title case: `Price Low` |
| Showing `inter`, `SF Pro`, or other fonts | The font is Plus Jakarta Sans for everything |
| Showing prices in a regular sans-serif font | Prices are always JetBrains Mono |
| Exclamation points in body copy | The brand is calm. Full stop, not exclamation. |
| Dark device frames with a light screen inside | Screen is always dark — use dark frames or no frame |
| "Best Buy" used as a compliment | It's a retailer name in the comparison table |
| Chart without blur for free tier mockups | The paywalled chart has a blur overlay — keep it |
| Any color besides green/red/zinc for signals | These three are fixed. No purple, orange, yellow. |

---

## 15. Quick Reference Card

```
──────────────────────────────────────────────
PRICERADAR UI — QUICK REFERENCE
──────────────────────────────────────────────
Background:       #09090B    near-black zinc
Card surface:     rgba(24,24,27,0.80)
Card border:      rgba(255,255,255,0.06)
Text:             #FAFAFA    near-white
Secondary text:   #A1A1AA    zinc-400
Primary CTA:      #FFFFFF    white button

Signal — Low:     #10B981    emerald green
Signal — High:    #EF4444    red
Signal — Neutral: #A1A1AA    zinc-400

Font (everything): Plus Jakarta Sans
Font (prices):     JetBrains Mono (tabular)

Grain overlay:    3.5% opacity over entire screen
Glass blur:       backdrop-filter: blur(20px)
Border radius:    12px cards, 32px nav pill

──────────────────────────────────────────────
HERO VISUAL:
Sony WH-1000XM5 · green "Price Low" badge
$279.99 (JetBrains Mono) · 90-day low · -22%
Background: #09090B · Card: rgba(24,24,27,0.80)
──────────────────────────────────────────────
HERO COPY:
"Is this price actually a good deal?"
──────────────────────────────────────────────
URL:  priceradar.io
Name: PriceRadar  (one word, capital P and R)
──────────────────────────────────────────────
```
