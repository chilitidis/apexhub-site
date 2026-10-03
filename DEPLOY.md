# Ανέβασμα στο apexhub.gr

## 0. Μετακόμισε τον φάκελο — πρώτο βήμα, όχι τελευταίο

Αυτή τη στιγμή ο φάκελος κάθεται **μέσα** στο `apexhub-backoffice`, επειδή
εκεί μόνο είχα πρόσβαση να γράψω. Δεν πρέπει να μείνει εκεί: ήδη μου χάλασε
δύο φορές το build, γιατί το Next ανέβαινε στον γονικό φάκελο και έβρισκε
το PostCSS και τα `@types` του back office. Τα παρέκαμψα, αλλά η σωστή λύση
είναι να φύγει.

    mv ~/Documents/apexhub-backoffice/apexhub-site ~/Documents/apexhub-site
    cd ~/Documents/apexhub-site
    rm -rf node_modules .next
    npm install
    npm run dev          # http://localhost:3000

Το `apexhub-site/` το έβαλα στο `.gitignore` του back office, ώστε να μην
μπει κατά λάθος σε commit πριν προλάβεις να το μετακομίσεις.

## 1. Δικό του repo

    cd ~/Documents/apexhub-site
    git init && git add -A && git commit -m "APEXHUB public site"
    # φτιάξε άδειο repo apexhub-site στο GitHub και μετά:
    git remote add origin git@github.com:<χρήστης>/apexhub-site.git
    git push -u origin main

## 2. Νέο project στο Vercel

Vercel → Add New → Project → διάλεξε το `apexhub-site`.

- Framework: Next.js (το βρίσκει μόνο του)
- Root directory: `./`
- Μεταβλητές περιβάλλοντος: **καμία προς το παρόν**

Είναι σκόπιμα **ξεχωριστό project** από το `apexhub-backoffice`. Το δημόσιο
site το βλέπουν άγνωστοι και πρέπει να είναι πάντα όρθιο· το back office
αλλάζει καθημερινά. Αν μοιράζονταν deployment, κάθε build του back office
θα ρίσκαρε το site.

## 3. Το domain

Στο Vercel → το νέο project → Settings → Domains → Add:

    apexhub.gr
    www.apexhub.gr      (ρύθμισέ το να κάνει redirect στο σκέτο)

**Πού βρίσκεις πού είναι καταχωρημένο το apexhub.gr:** το `portal.apexhub.gr`
δουλεύει ήδη, άρα το DNS είναι κάπου και δουλεύει. Άνοιξε

    Vercel → apexhub-backoffice → Settings → Domains → portal.apexhub.gr

Εκεί φαίνεται αν το domain είναι καταχωρημένο στο Vercel ή αν δείχνει αλλού
με nameservers. Αν δείχνει αλλού, το όνομα του παρόχου θα είναι εκεί.

Μετά, στον πάροχο του DNS:

| Τύπος | Όνομα | Τιμή                  |
|-------|-------|-----------------------|
| A     | `@`   | `76.76.21.21`         |
| CNAME | `www` | `cname.vercel-dns.com` |

Το `portal` **μην το αγγίξεις** — μένει όπως είναι και δείχνει στο back office.

Το Vercel θα σου δείξει τις ακριβείς τιμές όταν προσθέσεις το domain· αν
διαφέρουν από τον πίνακα, εμπιστέψου το Vercel. Το πιστοποιητικό βγαίνει
μόνο του μέσα σε λίγα λεπτά αφού περάσει το DNS.

## 4. Μετά το ανέβασμα

Σειρά που βγάζει νόημα:

1. **Telegram-gated login** — `/login` με το Telegram Login Widget. Ο
   χρήστης πατάει «Login with Telegram», εμείς επαληθεύουμε την υπογραφή με
   το token του bot, και μετά ρωτάμε `getChatMember` για το chat
   `-1002941896530`. Αν είναι `member`, `administrator` ή `creator`, περνάει.
   Το cookie μπαίνει στο `.apexhub.gr`, ώστε να ισχύει και στο `portal`.
2. **Υπενθυμίσεις λήξης** — χρειάζεται λογαριασμός Resend και verified
   domain. Μέχρι να γίνει αυτό, δεν μπορεί να φύγει ούτε ένα email.
3. **Ακαδημία** — χρειάζεται απόφαση για video hosting (προτείνω Bunny
   Stream) και να μου πεις αν υπάρχει ήδη υλικό.
4. **Ultimate Trading Journal**.

## Εκκρεμότητα ασφαλείας, άσχετη με αυτό το project

Το `apexhub-backoffice` τρέχει **Next 14.2.15**, που έχει δημοσιευμένο
security advisory. Εδώ έβαλα 14.2.35. Αξίζει να αναβαθμιστεί και το back
office — είναι patch μέσα στην ίδια minor, δεν σπάει τίποτα.
