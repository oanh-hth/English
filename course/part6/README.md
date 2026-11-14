# Part 6: Users and authentication

**Goal.** People can sign up and log in, and every note, plant and review belongs to exactly one user who is the only one who can see it.

**You will learn:** password hashing, JSON Web Tokens, authentication versus authorisation, protected routes, and the basic hardening every public server needs.

## a. Passwords and sign up

**Never store a password.** Store a **hash**: the output of a one-way function. Logging in means hashing what the user typed and comparing. A **slow, salted** hash such as **bcrypt** makes stolen databases hard to crack. Fast hashes like SHA-256 are the wrong tool for passwords.

```bash
npm i bcrypt && npm i -D @types/bcrypt
```

```ts
const passwordHash = await bcrypt.hash(password, 12);          // 12 = cost factor, tune to ~250 ms
const ok = await bcrypt.compare(attempt, user.passwordHash);   // constant-time comparison
```

Sign-up rules to implement: username 3 to 30 characters, password at least 10 characters (length beats cleverness), and a **unique** username enforced by the database. If two people sign up at once with the same name, the **unique index** rejects the second. Catch `UniqueConstraintError` and return `409`, rather than checking first and racing.

**Authentication** answers *who are you?* **Authorisation** answers *what may you do?* They are separate checks.

### Exercises

**6.1.** Write `POST /api/users` with zod validation (`username`, `password`). Hash the password with bcrypt and store only the hash. Return `201` with `{ id, username }` and **never** the hash.

**6.2.** Catch the duplicate-username error and return `409 Username already taken`. Test with two simultaneous requests (`curl ... &`).

**6.3.** Look at your `users` row in `psql`. Confirm the hash is different if two users pick the same password. Explain why in `NOTES.md` (salt).

**6.4.** Create a `toPublicUser()` function that picks safe fields. Make a rule for yourself: **never** return a Sequelize model straight from a route.

**6.5.** Add a password strength message that does not leak anything: "At least 10 characters". Do not impose character-class rules.

## b. Tokens and protected routes

HTTP forgets you between requests. After login the server gives the client a **token** and the client sends it back with each request: `Authorization: Bearer <token>`. A **JSON Web Token (JWT)** is a small signed JSON document: `{ "sub": 7, "exp": 1763200000 }`. The server **signs** it with a secret only it knows, so it can later verify nobody changed it, without storing anything.

```bash
npm i jsonwebtoken && npm i -D @types/jsonwebtoken
```

```ts
const token = jwt.sign({ sub: String(user.id) }, config.jwtSecret, { expiresIn: '7d' });

export const requireAuth: RequestHandler = (req, _res, next) => {
  const header = req.get('authorization') ?? '';
  if (!header.startsWith('Bearer ')) throw new HttpError(401, 'Login required');
  try {
    const payload = jwt.verify(header.slice(7), config.jwtSecret) as jwt.JwtPayload;
    req.userId = Number(payload.sub);
    next();
  } catch { throw new HttpError(401, 'Invalid or expired token'); }
};
```

To type `req.userId`, **augment** Express's `Request` interface in a `types.d.ts` file (declaration merging).

**The JWT secret is a password for the whole system.** It comes from the environment, it is long and random (`openssl rand -base64 48`), and it is **never** in git. If it leaks, anyone can forge tokens. A JWT cannot be revoked by itself. If you need "log out everywhere", keep a `token_version` on the user and put it in the token, or keep a sessions table. Decide, and write down the trade-off.

**Ownership checks** are the heart of authorisation. Every query for a note must include the user: `WHERE id = :id AND user_id = :userId`. A note that exists but belongs to someone else must look like it does not exist: answer `404`, not `403`, so you do not reveal what exists.

### Exercises

**6.6.** Write `POST /api/login`. Return `401 Wrong username or password` for **both** a wrong password and an unknown username (same message, same timing as far as you can: always run `bcrypt.compare`, even against a dummy hash).

**6.7.** Add `JWT_SECRET` to `config.ts` (required in production, at least 32 characters, no default). Put a long random one in your local `.env` and a placeholder in `.env.example`.

**6.8.** Write `requireAuth` and type `req.userId`. Apply it to every `/api/notes`, `/api/reviews` and later routes, but not to sign-up, login and health.

**6.9.** Scope every notes query by `userId`. Create two users and prove with `curl` that user B gets `404` when reading, editing or deleting user A's note id.

**6.10.** Add `GET /api/me` returning the current user and their settings (`dailyCap`), and `PUT /api/me` to change `dailyCap` (1 to 50). Use `dailyCap` in the scheduler instead of the constant 10.

**6.11.** Decide between **a token in `localStorage`** (simple, readable by any script on the page, so one XSS hole steals it) and **an `httpOnly` cookie** (JavaScript cannot read it, but you now need CSRF protection). Write a half-page decision in `NOTES.md`. This course uses `localStorage` for simplicity. Say what extra protection you add because of that (a strict Content Security Policy, no `dangerouslySetInnerHTML`).

**6.12.** Make tokens expire in 7 days. Check that an expired token (set `expiresIn: '1s'`, wait) returns `401`.

## c. Hardening

An open server on the internet is attacked within hours. The basics:

- **Rate limit the login route** so passwords cannot be guessed at speed (`express-rate-limit`, for example 10 attempts per 15 minutes per IP). Remember behind a proxy (Render, nginx) you need `app.set('trust proxy', 1)` so the limiter sees the real client IP.
- **`helmet`** sets safe default headers (no sniffing, no framing, a basic CSP).
- **CORS**: if the front end is served from the same origin you need none. If not, allow exactly your front end's origin, never `*` with credentials.
- **Do not leak.** Same message for login failures, no stack traces, no hashes in responses, no SQL errors to the client.
- **Validate size.** `express.json({ limit: '100kb' })` stops giant bodies.
- **Delete means delete.** A user must be able to delete their account and all their data (the `ON DELETE CASCADE` rules you wrote in Part 4).

### Exercises

**6.13.** Add `helmet`. Look at the response headers before and after with `curl -i`.

**6.14.** Rate limit `POST /api/login` to 10 attempts per 15 minutes per IP, answering `429` with a clear message. Prove it works with a loop.

**6.15.** Add `PUT /api/me/password` (current password required, new password validated). Return `204`. A wrong current password returns `403`.

**6.16.** Add `DELETE /api/me` requiring the password again. Delete the user in a transaction and show with `psql` that every related row vanished.

**6.17.** Set `express.json({ limit: '100kb' })` and test with a 1 MB body: the answer must be `413`.

**6.18.** Write the **authorisation test matrix** as a table in `NOTES.md`: for each route, what happens with no token, a bad token, another user's token and the owner's token. You will turn it into automated tests in Part 10.

## Checkpoint 6

- [ ] Sign up, log in and log out flow works with `curl`.
- [ ] Passwords are stored as bcrypt hashes. The JWT secret is only in `.env`, which git ignores.
- [ ] Every data route requires a token and is scoped to the owner. Other users' ids give `404`.
- [ ] Login is rate limited, headers come from `helmet`, errors do not leak.
- [ ] You can explain authentication versus authorisation and the localStorage-versus-cookie trade-off.

Tag it: `git tag part6`. Run `git log -p | grep -i secret` and make sure nothing sensitive was ever committed. If something was, **rotate it**, do not just delete it.
