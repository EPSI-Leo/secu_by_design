# Vault + MariaDB Demo Stack

Un mini-projet **tout-en-conteneurs** qui montre :

* une base **MariaDB 11** avec :
  * base `testvault`
  * user `testvault`
  * table `livre(id, titre)` et trois romans de Jules Verne / Hugo / Dumas
* un **service Vault 1.16** (mode *dev*) pour stocker les secrets
* une **API Node.js / Express** qui lit ses identifiants dans Vault et renvoie le contenu de `livre`  
  → `GET /` ➜ JSON

> Le mot de passe peut être modifié **dans la base et dans Vault sans toucher au code** :  
> l’appli relit le secret à chaque requête.

---

## 1. Prérequis

* Docker 20+ et Docker Compose v2  
* `curl` ou Postman pour tester l’API  
* (optionnel) le binaire **vault** si tu veux taper les commandes Vault depuis l’hôte

---

## 2. Arborescence

```
.
├── docker-compose.yml
├── db/
│   └── init.sql           # création base, user, table, données
└── app/
    ├── Dockerfile
    ├── package.json
    ├── package-lock.json  # (facultatif mais conseillé)
    └── index.js
```

---

## 3. Démarrage rapide

```bash
# clone du repo puis :
docker compose up --build -d
```

* MariaDB écoute sur **localhost:3306**  
* Vault écoute sur **localhost:8200** (token root = `root`)  
* L’API écoute sur **localhost:3000**

---

## 4. Initialisation de Vault

Vault tourne en **mode dev** : un seul nœud, pas de TLS et token root.  
Exécute les 3 commandes suivantes **dans le conteneur Vault** :

```bash
# 1) ouvrir un shell Vault
docker compose exec vault sh
export VAULT_ADDR=http://127.0.0.1:8200   # important : http (pas https)

# 2) login
vault login root

# 3) activer un KV v2 monté sur /kv
vault secrets enable -path=kv kv-v2

# 4) stocker les identifiants de la base
vault kv put kv/db username=testvault password=changeme

exit   # sortir du conteneur
```

---

## 5. Tester l’API

```bash
curl http://localhost:3000
```

Réponse attendue :

```json
[
  { "id": 1, "titre": "Le Comte de Monte-Cristo" },
  { "id": 2, "titre": "Les Misérables" },
  { "id": 3, "titre": "Voyage au centre de la Terre" }
]
```

---

## 6. Rotation du mot de passe (preuve que le code ne change pas)

```bash
# 1) changer le mot de passe dans MariaDB
docker exec -it mariadb mariadb -uroot -prootpass -e   "ALTER USER 'testvault'@'%' IDENTIFIED BY 'newpass'; FLUSH PRIVILEGES;"

# 2) mettre à jour le secret Vault
docker compose exec vault sh -c   'export VAULT_ADDR=http://127.0.0.1:8200 &&    vault login -no-print root &&    vault kv put kv/db username=testvault password=newpass'

# 3) l'API fonctionne toujours
curl http://localhost:3000        # même JSON
```

---

## 7. Arrêter et nettoyer

```bash
docker compose down -v   # -v supprime aussi le volume MariaDB
```

---

## 8. Pour aller plus loin (prod ready)

| Sujet | Démo | Pour la prod |
|-------|------|--------------|
| Vault | mode `dev`, pas de TLS, token root | backend Raft HA, TLS, policies, AppRole + Vault Agent |
| Secrets DB | stockés en clair | plugin **`database/`** Vault → rotation auto, TTL |
| API | lit Vault à chaque requête | cacher le secret (TTL) ou template + SIGHUP |
| Réseau | pas chiffré | mTLS ou réseau privé |

