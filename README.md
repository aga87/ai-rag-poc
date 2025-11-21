# AI RAG POC

Classic **RAG setup with persistent knowledge ingestion**, followed by **runtime Q&A using pre-indexed knowledge**, all within a **Node.js + OpenAI** environment.


## Tech stack

- Node
- Typescript
- Firebase Functions
- OpenAI API
- Google Cloud Storage

## Managing environment variables

### In staging and production

Make sure you add the secrets to the Secret Manager before deploying: 

```shell
# Select the environment
firebase use staging
# Set the secret (it will prompt you to add the value)
firebase functions:secrets:set SECRET_NAME 
# Check if the secret was added correctly
firebase functions:secrets:access SECRET_NAME
```

Note: Secret parameters defined in this way must be bound to individual functions that should have access to them!


To access secrets in code: 

```ts
import { defineSecret } from "firebase-functions/params";

const teslaClientId = defineSecret("SECRET_NAME");

const value = teslaClientId.value() // but inside a fn (not in global scope)
```

### In local development

When using the Firebase Emulator:

- When you spin up the Firebase emulator it will say: `functions: Loaded environment variables from .env.local.`, BUT
- If the variable is also defined with `defineSecret` (or similar) and exists in Google Secret Manager, the Firebase emulator will use the value from the Secret Manager even if accessed with `process.env`!
- Only if the variable does not exist in Google Secret Manager, the Firebase Emulator will use the one defined in the local `.env`

Please also check `env.example` for non-secret local development configuration!
