# AdWorth

Website and admin panel for AdWorth, a digital marketing agency (videography, video editing, posters and design, social media management, websites).

## Run locally

Static site, no build step. Open `index.html`, or run `python3 -m http.server 8000` in this folder.

## Pages

- `/` public website
- `/#admin` admin panel (services, portfolio, enquiries, homepage text)

## Hosting on GitHub Pages

Repository Settings, Pages, Source: Deploy from a branch, Branch: `main`, folder `/ (root)`.

## Notes

- Admin data and contact form enquiries are saved in each visitor's own browser (localStorage), not shared between devices. Collecting real enquiries needs a backend or database.
- There is no login, so anyone who opens `/#admin` can use the panel in their own browser. Add authentication before connecting a real database.
- Brand colors come from the logo: pink #FF0066, magenta #FC027D, purple #B002B7.
