import { DJDog } from './bot/DJDog';
import Secrets from './Secrets';
import express from 'express';
import youtubedl from 'youtube-dl-exec';
import { exec } from 'child_process';

const app = express();

app.get('/', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(process.uptime()));
});

const port = process.env.PORT || 3000;

app.listen(port);

let djDog: DJDog;

Secrets.getSecrets().then((s) => {
  djDog = new DJDog(s.token, s.client_id);
});