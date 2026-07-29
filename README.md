# Arsaskor Sorgu

Build a mobile-first prototype for "arsaskor", a Turkish land-due-diligence

app. All UI text is Turkish. Render inside a 390×844 phone frame on desktop.

## What the product does

A person about to buy land in Turkey enters a parcel identifier

(province / district / neighbourhood / block "ada" / plot "parsel"). The app

checks official land and zoning records and returns a plain-Turkish

assessment: zoning status, risks, and — critically — what could NOT be

determined.

It is NOT a valuation tool. It never shows prices, never says "buy" or

"don't buy", never predicts future zoning. It reports a stance; the user

decides.

## Who uses it, and where

Non-professional buyers, ages ~30–65, mixed tech literacy. Two contexts

that must drive the design:

1. Standing on the land, outdoors, in sunlight, one-handed. High contrast

   and large touch targets (min 44px) are functional requirements, not

   preferences.

2. Sitting across from the seller. The result screen gets shown to another

   person and screenshotted. It must read as a document, not a dashboard.

## The core design problem

The product's most valuable output is often "this is unknown — go ask about

it." Some checks are impossible because no public dataset exists; some

information is legally closed. The design must make **absence of data feel

like honesty, not like a broken app.**

Three states must be distinguishable at a glance and must never collapse

into each other:

- checked, clean

- checked, problem found

- COULD NOT BE CHECKED

## Screens to build now

### 1. Query form (`/`)

- Remaining query credits strip at top (each query costs one credit)

- Three cascading searchable selects: province → district → neighbourhood

  (Turkey has 81 provinces, ~970 districts, tens of thousands of

  neighbourhoods — a plain dropdown is unusable, search is mandatory)

- Changing a parent selection must visibly clear its children

- Two numeric inputs: Ada, Parsel

- Submit button + a note that no credit is charged when the records yield

  nothing

- States: empty, partial, disabled child select, searching, no results

### 2. Result card (`/sonuc/:id`) — build ALL THREE variants

Block order is fixed:

score + verdict → summary → four status cards → "Almadan önce mutlaka sor"

(questions for the seller) → follow button → "Nasıl hesaplandı?" link →

sources → legal disclaimer, always last, never conditional.

Variant A — score 98, verdict "Güçlü konumda"

Variant B — score 0, verdict "Yatırıma uygun değil" (a hard elimination

            rule fired)

Variant C — NO SCORE, verdict "Yeterli veri yok"

            Show neither a number nor "/100". Use an em dash. This is not

            an error state — it is a first-class, frequent, honest answer

            and must look composed, not broken.

Four status cards, each with a level, a short explanation, and a list of

what could not be measured:

İmar planı durumu · Çevredeki plan hareketliliği · Arazinin fiziksel

durumu · Tapu ve hukuki durum

## Design direction

Reference aesthetic: a laboratory report, a cadastral survey sheet, a

measurement instrument. Warm off-white paper, dark ink, generous

whitespace, thin rules. Colour appears only where it carries meaning.

Deliberately AGAINST the visual language of Turkish real-estate marketing

(gold + navy, drone shots, luxury promises, urgency) — that language

belongs to the actors who harm this user most.

### Colours — use exactly these

Base:

  ink            #16191C   primary text

  ink-muted      #5A6169   secondary text

  paper          #FBF9F5   app background

  surface        #FFFFFF   card background

  rule           #E4E0D8   borders, dividers

Accent (single):

  accent         #C2542E   primary action, active state

  Must not exceed ~5% of screen area.

Score ramp — six steps, ONLY for the score indicator and verdict:

  strong         #1E6A4C   "Güçlü konumda"

  good           #5F8339   "Umut verici"

  medium         #A8791F   "Temkinli yaklaş"

  weak           #B4552F   "Riskli"

  eliminated     #8C2F2F   "Yatırıma uygun değil"

  unknown        #8A8F94   "Yeterli veri yok"

"unknown" is deliberately neutral grey. Rendering it green or red would

turn an absence of information into a judgement. Never colour it.

Status cards use FIVE levels only (good / medium / low / weak / unknown) —

they never use the sixth "eliminated" step.

### One conflict you must handle

`accent #C2542E` and `weak #B4552F` are nearly the same orange-red. On a

result card showing "Riskli", the primary action button would sit next to

the verdict in almost the same colour, and the user could read the action

as a warning.

Rule: **the score ramp owns filled colour; actions use outline + accent

text, not accent fill.** Apply this consistently.

### Colour is never the only signal

Level differences must survive colour blindness and direct sunlight. Back

every level with a label, and with shape or position — not hue alone.

### Typography

  IBM Plex Sans — headings and body

  IBM Plex Mono — numerals, ada/parsel identifiers, measurements

Mono on the parcel identifiers is deliberate: it makes them read as

instrument output.

  score        44 / weight 500

  screen title 20 / 500

  card title   15 / 500

  body         15 / 400, line-height 1.6

  helper       13 / 400

  label, mono  12 / 400

Never use weight 700. Emphasis is 500.

Turkish glyph support is mandatory — test with:

"Çanakkale'de ığdır ışığı, şişli'nin öğüdü — İMAR DURUMU BİLİNMİYOR"

Note that dotless ı and dotted İ are broken in many fonts.

### Form

  radius: 8 cards, 6 buttons, 20 pill badges

  border: 1px #E4E0D8

  spacing scale: 4 / 8 / 12 / 16 / 24 / 32

  card padding: 16

NO shadows. NO gradients. Separation comes from thin borders and

background tone. shadcn components ship with shadows by default — strip

them.

### Icons

Thin line (1.5px), single colour, no fill. Lucide. Functional icons only:

map, road, scale, chart. Never house, key, deed, money, handshake.

### No imagery

No photographs, no illustrations, no stock imagery anywhere.

## Copy rules

- Short sentences, average under 12 words

- Impersonal, passive statements: "yapılamaz", "görünmüyor" — never

  "yapamazsınız"

- No exclamation marks. No emoji.

- Never these words: kesinlikle, garanti, kaçırmayın, fırsat, muhteşem,

  değerlenecek, kâr, kazanç, risksiz, tavsiye ediyoruz

- Uncertainty is stated plainly: "bilinmiyor", "kontrol edilemedi"

Mandatory disclaimer, last element of every result screen, never shortened

or hidden behind a toggle:

"Bu bir değerleme raporu veya yatırım tavsiyesi değildir."

## Technical requirements

- Put every colour, spacing, radius and font-size value into the Tailwind

  theme config as named tokens. I need to extract them — they get ported

  into a React Native StyleSheet, which has no CSS.

- Keep components small and presentational; mock all data locally.

- Light theme only for now.

- No shadow, gradient, blur or backdrop-filter utilities anywhere.

Start with the query form and all three result-card variants. We will add

the transparency screen, history, watchlist and settings next.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7e934e50-5dab-4921-8903-7085d4fa4963).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
