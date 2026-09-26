# Vistracept Gifting Catalogue 2026-27

A categorized e-catalogue (Home / Products / Contact) for the Vistracept
corporate gifting range, styled to match the brand's premium black-and-gold
identity. No backend, no build step — plain HTML/CSS/JS. Works on GitHub
Pages, Netlify, or any static host.

## Structure
- **Home** — hero banner, links into Products/Contact.
- **Products** → **Category** (Glassware, Opalware, Thermoware, Bed Linen,
  Bath Linen, Top of Bed, Gifting Combos) → **Sub-group** (e.g. "Bedsheet
  Sets") → **Individual products**, each with a serial number (e.g. `BL-01`).
- **Contact** — enquiry details plus an automatic "My List": tap "+ Add to
  list" on any product while browsing, and it shows up here with its serial
  number, ready to copy or email in one click.

## Files
- `index.html`, `styles.css`, `app.js` — the app
- `products.json` — all 94 products with category/subgroup/serial/etc.
- `categories.json` — the category → sub-group tree with cover images
- `images/` — product photos, the hero banner, ribbon accent strip, and logo marks

## Publish it on GitHub Pages
1. Create a new **public** repository (e.g. `gifting-catalogue`).
2. Upload every file here, keeping `images/` as a folder.
3. Repo → **Settings → Pages** → Source: "Deploy from a branch", branch
   `main`, folder `/ (root)`. Save.
4. Your link: `https://<your-username>.github.io/gifting-catalogue/`

## Before sharing, edit the Contact page details
Open `app.js`, find `renderContact()`, and replace these placeholders:
- `sales@vistracept.example` (appears twice — the visible email and the
  `mailto:` address)
- `+91 00000 00000`
- `Add your office address here`

## Updating products later
Edit `products.json` / `categories.json`, drop new images into `images/`.
No other file needs to change.
