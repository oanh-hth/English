## Hint 1
`const app = express(); app.use(express.json({ limit: '1mb' }));` then one `app.get/post/put/delete` per line of the table.

## Hint 2
Inside a handler: `const result = parseChartInput(req.body); if (!result.ok) return void res.status(400).json({ errors: result.errors });` TypeScript then knows `result.value` exists below.

## Hint 3
A middleware with four parameters `(err, req, res, next)` is an error handler. body-parser marks bad JSON with `err.type === 'entity.parse.failed'`. Register it last, after the `/api` catch-all 404.
