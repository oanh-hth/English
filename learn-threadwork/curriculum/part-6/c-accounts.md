# Part 6c: Accounts and protected routes

*[Part 6: A Node.js server](README.md) · section c*

Your data is personal, so the server needs accounts: register, log in, and only ever see your own data. In this section you build them the safe way.

## Never store passwords

If the server stored passwords and the data file leaked, every password would leak with it, and people reuse passwords. Store a **hash** instead: a one-way scramble. To check a login, hash what was typed and compare.

A plain fast hash is not enough: attackers try billions of guesses per second. Use a **slow, salted** password hash. Node includes **scrypt**:

```ts
const salt = randomBytes(16);                   // different for every user
const hash = await scrypt(password, salt, 32);  // slow on purpose
store(`scrypt$${salt.toString("hex")}$${hash.toString("hex")}`);
```

The **salt** makes two people with the same password get different hashes, so one guess can't crack many accounts. Compare hashes with `timingSafeEqual`: it takes the same time whether the first byte differs or the last, so response times reveal nothing.

## Tokens: staying signed in

After login, the server gives the app a **token**, and the app sends it with every request:

```
Authorization: Bearer eyJzdWIiOiJ1MSIsImV4cCI6MTc…
```

A token here is two parts: the **payload** (`{ sub: userId, exp: expiryTime }`, base64url-encoded) and a **signature**, an HMAC of the payload made with a secret only the server knows. If anyone edits the payload, the signature no longer matches. So the server can trust it without storing sessions. (JWTs, which you'll meet elsewhere, work the same way.)

Check in this order: signature first, then expiry, and only then trust the contents. Any problem means `null`, never a crash.

## Protecting routes with middleware

```ts
function requireAuth(secret) {
  return (req, res, next) => {
    const payload = verifyToken(tokenFromHeader(req), secret);
    if (!payload) return res.status(401).json({ error: "Sign in first" });
    res.locals.userId = payload.sub;     // later handlers know who's asking
    next();
  };
}
app.use("/api/state", requireAuth(secret), stateRouter(store));
```

## Error messages that don't leak

When login fails, say the same thing for "no such email" and "wrong password": "Email or password is wrong". Otherwise anyone could find out which emails have accounts.

## Read more
- OWASP password storage cheat sheet: <https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html>
- Node `crypto.scrypt`: <https://nodejs.org/api/crypto.html#cryptoscryptpassword-salt-keylen-options-callback>
- HMAC (Wikipedia): <https://en.wikipedia.org/wiki/HMAC>
- JSON Web Tokens: <https://jwt.io/introduction>

---

## Exercises 6.3

Run the tests for an exercise with `npm run ex <number>`; they re-run every time you save. When they are all green, commit, and move on. `npm run progress` shows your checklist.

### 6.3: Password hashing, tokens and protected routes

**Edit:** `app/server/src/auth.ts` · **Tests:** `tests/part-6/6.3-auth.test.ts` · **Run:** `npm run ex 6.3`

Write `hashPassword`, `verifyPassword`, `signToken`, `verifyToken`, `requireAuth` and `authRouter` (register and login). The tests try forged, expired and tampered tokens, so the order of checks matters.

---

[← 6b A REST API](b-rest-api.md) · [6d Saving data on the server →](d-storage.md)
