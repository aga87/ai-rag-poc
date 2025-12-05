# AI RAG POC

Classic **RAG setup with persistent knowledge ingestion**, followed by **runtime Q&A using pre-indexed knowledge**, all within a **Node.js + OpenAI** environment.

This project demonstrates a pipeline for:

1. Ingesting and embedding knowledge from static sources

	-	Reads PDF files from Google Cloud Storage
	-	Splits documents into paragraph-based chunks
	-	Generates OpenAI embeddings (text-embedding-3-small, dim: 1536)
	-	Persists embeddings + text content into Qdrant

2. Retrieving relevant context at query time using Vector Search (K-Nearest Neighbors)

	-	Performs semantic search in Qdrant using cosine similarity
	-	Returns top-K matches (default: 5 for speed + relevance balance)
	-	Includes payloads containing the original text chunks

3. Answering questions using OpenAI models restricted to the retrieved documentation

	-	Injects results into a structured system/user prompt
	-	Uses OpenAI to answer only from the provided documentation


## Tech stack

- Node
- Typescript
- Firebase Functions
- OpenAI API
- Google Cloud Storage
- Qdrant Vector Database


## Git Branches

- `main` – Production branch. This branch represents the stable and production-ready version of the code. It is used for deployments to the live environment.

- `dev` – Development branch. This is the default branch for ongoing development work. It is where new features and bug fixes are implemented and tested before being merged into the main branch. It is used for deployments to the staging environment.


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
