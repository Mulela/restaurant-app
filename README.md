# 🍔 Restaurant App

Application de commande en ligne pour restaurant, avec interface moderne et backend Supabase.

---

## 🚀 Stack

- React + Vite
- Tailwind CSS v4
- Supabase (PostgreSQL + API)

---

## ✨ Features

- 🧾 Menu dynamique (chargé depuis la base de données)
- 🛒 Panier (stocké en localStorage)
- 📦 Commande en ligne
- ⏱️ Suivi de commande
- 🛠️ Interface admin (gestion produits + statuts)

---

## ⚙️ Installation

### 1. Cloner le projet

```bash
git clone https://github.com/TON_USERNAME/restaurant-app.git
cd restaurant-app
npm install
```
### 2. Variables d’environnement

Créer un fichier .env à la racine :

VITE_SUPABASE_URL=your_supabase_url

VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

### 3. Configuration de la base de données (Supabase)
Créer un projet sur Supabase
Aller dans SQL Editor
Copier le contenu du fichier :
/supabase/schema.sql
Exécuter le script

👉 Cela va créer :

tables (products, orders, order_items)
relations
index
policies (RLS)
### 4. Lancer le projet
npm run dev
🧠 Fonctionnement
Les produits sont récupérés depuis Supabase
Le panier est stocké en local (pas d’auth utilisateur)
Les commandes sont envoyées en base
L’admin peut :
ajouter / modifier / supprimer des produits
changer le statut des commandes
🔐 Sécurité

Les policies RLS sont volontairement ouvertes (using (true)) pour simplifier :

⚠️ Mode démo uniquement
👉 À sécuriser avec authentification en production

🔮 Améliorations possibles

Authentification (Supabase Auth)

Dashboard admin sécurisé

Paiement en ligne (Stripe)

Notifications en temps réel


## 🌍 Live Demo
https://restaurant-app-nu-green.vercel.app