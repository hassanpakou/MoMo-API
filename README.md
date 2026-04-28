# 🚀 Intégration de l’API MTN MoMo (Collections)

Ce guide explique comment intégrer l’API **MTN MoMo Collections** pour accepter les paiements mobile money dans votre application SaaS (ex: CongoEats).

---

## 🎯 Cas d’usage

* 💳 **Abonnement** : paiement des plans (Starter / Business)
* 🛒 **Commande publique** : paiement depuis le menu client

---

# 🧱 Prérequis

Avant de commencer :

1. Créer un compte sur MTN MoMo Developer Portal
2. Souscrire au produit **Collections**
3. Avoir :

   * Node.js ≥ 18
   * Next.js ≥ 14
4. Avoir un projet prêt (frontend + backend API)

---

# ⚙️ Configuration des variables d’environnement

Créer un fichier `.env.local` :

```env
# Sandbox (test)
MOMO_CALLBACK_HOST=https://votre-domaine.com/api/payments/momo-webhook
MOMO_USER_API_KEY=********************
MOMO_USER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MOMO_PRIMARY_KEY=********************

# Production (après validation MTN)
# MOMO_CALLBACK_HOST=https://votre-domaine.com/api/payments/momo-webhook
# MOMO_USER_API_KEY=...
# MOMO_USER_ID=...
# MOMO_PRIMARY_KEY=...
```

---

# 🔑 Étape 1 : Obtenir les Subscription Keys

1. Aller sur : [https://momodeveloper.mtn.com](https://momodeveloper.mtn.com)
2. Aller dans **Products**
3. Choisir **Collections**
4. Cliquer sur **Subscribe**
5. Récupérer la **Primary Key**

👉 Cette clé sera utilisée comme :

```env
MOMO_PRIMARY_KEY=...
```

---

# 🧪 Étape 2 : Générer API User & API Key (Sandbox)

Installer le package :

```bash
npm install mtn-momo-api
```

---

## Générer les identifiants :

```bash
npx momo-sandbox \
--callback-host https://votre-url-ngrok.ngrok.io/api/payments/momo-webhook \
--primary-key <PRIMARY_KEY_SANDBOX>
```

---

## Résultat :

```text
userId: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
userApiKey: ********************************
```

👉 Copier dans `.env.local`

---

# 🌐 Étape 3 : Exposer le webhook (local)

Utiliser ngrok :

```bash
ngrok http 3000
```

👉 Utiliser l’URL générée comme :

```env
MOMO_CALLBACK_HOST=https://xxxx.ngrok.io/api/payments/momo-webhook
```

---

# 💸 Étape 4 : Tester un paiement (Sandbox)

👉 Utiliser un numéro test :

```text
600000000
```

### Processus :

1. Lancer la requête de paiement
2. Le client reçoit une demande
3. Il valide avec PIN
4. MoMo envoie une réponse via webhook

---

# 🔄 Étape 5 : Vérifier le statut

Deux méthodes :

### ✔️ Webhook

Ton endpoint :

```bash
/api/payments/momo-webhook
```

---

### ✔️ Vérification manuelle

Via API → Payment Status

---

# 🚀 Passage en production

1. Faire le **KYC chez MTN**
2. Activer l’environnement **Production**
3. Générer nouvelles clés
4. Mettre à jour `.env` et Vercel
5. Tester avec de vrais numéros

---

# ⚠️ Dépannage

| Erreur                 | Solution                          |
| ---------------------- | --------------------------------- |
| 401 Access Denied      | Vérifier clé primaire + callback  |
| 404 /api/payments/momo | Mauvais chemin (attention au “s”) |
| Module not found       | `npm install mtn-momo-api`        |
| Pas de webhook         | Utiliser ngrok                    |
| Paiement non validé    | Vérifier association `order_id`   |

---

# 📦 Ressources

* Documentation officielle MTN MoMo
* Package npm `mtn-momo-api`
* Sandbox guide

---

# 🧠 Résultat final

Une fois intégré :

✔️ Paiement mobile pour commandes
✔️ Paiement abonnement SaaS
✔️ Système automatisé via webhook

---

# 🔥 Conclusion

Cette intégration permet à ton application :

* d’accepter des paiements mobile money
* d’automatiser les commandes
* de gérer les abonnements
