# 📦 Activer Firebase Storage

Pour que les utilisateurs puissent uploader leur photo de profil, vous devez activer **Storage** sur Firebase.

1. Allez sur votre [Console Firebase](https://console.firebase.google.com/project/speedstreak-783fb/overview).
2. Dans le menu de gauche, cliquez sur **Storage** (sous "Build").
3. Cliquez sur **"Get Started"** (Commencer).
4. Choisissez le mode **"Test mode"** (ou "Production mode" puis on changera les règles).
5. Gardez la région par défaut et cliquez sur **"Done"**.

**⚠️ TRÈS IMPORTANT : Les règles de sécurité !**
Une fois Storage activé, allez dans l'onglet **"Rules"** de Storage et copiez-collez ce code exact. Il permet aux utilisateurs connectés d'envoyer uniquement de petites images tout en vous protégeant des abus :

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}.jpg {
      allow read: if true;
      allow write: if request.auth != null 
                   && request.auth.uid == userId 
                   && request.resource.size < 5 * 1024 * 1024 
                   && request.resource.contentType.matches('image/.*');
    }
  }
}
```
Cliquez sur **Publier**. Dès que c'est fait, l'upload de photo fonctionnera sur votre téléphone !
