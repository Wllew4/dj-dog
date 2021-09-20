import { DJDog } from './bot/DJDog';
import Secrets from './Secrets';
import express from 'express';

const port = process.env.PORT || 8080;
const app = express();
app.set('trust proxy', true);
app.listen(port);

let djDog: DJDog;

Secrets.getSecrets().then((s) => {
  djDog = new DJDog(s.token, s.client_id);
});

app.get('/', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const stuff = {
    uptime: process.uptime(),
    GAE_APPLICATION:process.env.GAE_APPLICATION,
    GAE_DEPLOYMENT_ID:process.env.GAE_DEPLOYMENT_ID,
    GAE_ENV:process.env.GAE_ENV,
    GAE_INSTANCE:process.env.GAE_INSTANCE,
    GAE_MEMORY_MB:process.env.GAE_MEMORY_MB,
    GAE_RUNTIME:process.env.GAE_RUNTIME,
    GAE_SERVICE:process.env.GAE_SERVICE,
    GAE_VERSION:process.env.GAE_VERSION,
    GOOGLE_CLOUD_PROJECT:process.env.GOOGLE_CLOUD_PROJECT,
    NODE_ENV:process.env.NODE_ENV,
    PORT:process.env.PORT
  };
  res.end(JSON.stringify(stuff));
});