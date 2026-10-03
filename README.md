# apexhub-site

Το δημόσιο site του APEXHUB (apexhub.gr).

Ξεχωριστή εφαρμογή από το back office (portal.apexhub.gr), ίδια βάση
Supabase. Ο λόγος που είναι χωριστά: το δημόσιο site το βλέπουν άγνωστοι
και πρέπει να είναι πάντα όρθιο· το back office αλλάζει καθημερινά. Αν
μοιράζονταν deployment, κάθε build του back office θα ρίσκαρε το site.

## Τοπικά

    npm install
    npm run dev        # http://localhost:3000

## Δομή

    app/page.tsx        η landing page
    app/globals.css     όλο το design system
    components/Peak.tsx  η 3D κορυφή (client, φορτώνει μόνο στον browser)

## Μετά

- `/login` με Telegram Login Widget — μπαίνει μόνο όποιος είναι ήδη μέλος
  του VIP group (chat id -1002941896530, ο bot είναι admin εκεί)
- Ακαδημία και Ultimate Trading Journal, πίσω από το login
