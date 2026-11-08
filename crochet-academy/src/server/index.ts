import express from 'express';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { NotImplementedError } from '@/shared/todo';
import { ChartRepository } from './repository';
import { createApp } from './routes';
import { createPersistentRepository } from './fileStore';

/**
 * PROVIDED: starts the server. It adapts to how far you have got:
 *   - 4.4 done: charts are saved to data/charts.json
 *   - 4.4 not done yet: charts live in memory (lost on restart) and the log says so
 *   - 4.2 or 4.3 not done: a small stand-in server answers every /api call with a friendly 501
 */
const PORT = Number(process.env.PORT ?? 3001);
const DATA_FILE = process.env.DATA_FILE ?? resolve('data/charts.json');

async function buildApp() {
  let repo: ChartRepository;
  try {
    repo = (await createPersistentRepository(DATA_FILE)).repo;
    console.log(`Charts are saved in ${DATA_FILE}`);
  } catch (error) {
    if (!(error instanceof NotImplementedError)) throw error;
    console.log(`(Exercise ${error.exercise} is not built yet: charts will be lost when the server stops.)`);
    repo = new ChartRepository();
  }
  const app = createApp(repo);
  const dist = resolve('dist');
  if (existsSync(dist)) {
    app.use(express.static(dist));
    app.get('*', (_req, res) => res.sendFile(resolve(dist, 'index.html')));
  }
  return app;
}

async function main() {
  let app: express.Express;
  try {
    app = await buildApp();
  } catch (error) {
    if (!(error instanceof NotImplementedError)) throw error;
    console.log(`Exercise ${error.exercise} is not built yet. Starting a stand-in API that explains this.`);
    app = express();
    app.use('/api', (_req, res) => {
      res.status(501).json({ errors: [`Build exercise ${error.exercise} to bring the API to life (npm run learn test ${error.exercise})`] });
    });
  }
  app.listen(PORT, () => console.log(`API listening on http://localhost:${PORT}`));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
