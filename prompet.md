You are a Senior React, Vite and Security Engineer.

Perform a COMPLETE security audit of my React + Vite project.

Your objectives:

## 1. Scan the entire project

Recursively inspect every file including:

- src/
- public/
- vite.config.*
- package.json
- package-lock.json / pnpm-lock.yaml / yarn.lock
- .gitignore
- README
- GitHub Actions
- Netlify
- Vercel
- Docker
- Firebase
- Supabase
- Config files
- JSON
- JS
- JSX
- TS
- TSX
- CSS
- SCSS

Do not skip any file.

------------------------------------------------

## 2. Detect every hardcoded value

Find:

- API Keys
- Tokens
- Secrets
- Passwords
- URLs
- Client IDs
- Bearer Tokens
- JWT Secrets
- OpenAI Keys
- Stripe Keys
- Google Keys
- AWS Keys
- Firebase Config
- Supabase Config
- Cloudinary Keys
- Analytics IDs
- SMTP Credentials

------------------------------------------------

## 3. Classify each value

For every value determine whether it is:

A) Public and safe in frontend
Examples:

- Vite public variables
- Firebase apiKey
- Supabase URL
- Supabase anon key
- Analytics IDs

OR

B) Secret and MUST NEVER be shipped to the browser
Examples:

- Service Role Keys
- Secret Keys
- OpenAI API Keys
- Stripe Secret Keys
- Database passwords
- JWT Secret
- AWS Secret
- SMTP Passwords

Explain WHY.

------------------------------------------------

## 4. Move configuration correctly

Create:

.env

and

.env.example

For public frontend variables use:

VITE_*

Example:

VITE_API_URL=
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_FIREBASE_API_KEY=

Replace every hardcoded value with:

import.meta.env.VITE_VARIABLE_NAME

------------------------------------------------

## 5. Detect dangerous frontend secrets

If any secret is used directly inside React code:

Explain that this is insecure.

Recommend moving it to a backend API.

DO NOT simply rename it to VITE_*.

------------------------------------------------

## 6. Refactor code

Update every file using:

import.meta.env

Remove hardcoded values.

Preserve formatting.

Do not change functionality.

------------------------------------------------

## 7. Validate .gitignore

Ensure these are ignored:

.env
.env.local
.env.production
.env.development

------------------------------------------------

## 8. Detect unused environment variables

Find:

- unused variables
- duplicated variables
- missing variables
- dead configuration

------------------------------------------------

## 9. Search everywhere

Look inside:

JS
JSX
TS
TSX
HTML
JSON
CSS
SCSS
YAML
GitHub workflows
Netlify
Vercel
Docker

------------------------------------------------

## 10. Final report

Generate a report with:

Files scanned

Sensitive values found

Public values found

Secrets found

Variables moved to .env

Variables added to .env.example

Updated files

Potential security issues

Recommendations

------------------------------------------------

IMPORTANT

Do NOT move everything automatically.

First determine whether each value should remain public or should be moved to a backend.

Remember:

Everything inside VITE_* is publicly accessible to every user after build.

Treat this as a professional production security audit.
