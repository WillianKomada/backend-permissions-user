import express from 'express';
import { router } from './routes';
import cors from 'cors';
import "reflect-metadata";

import './database';

const app = express();

app.use(cors());

app.use(express.json());

app.use(router);

app.listen(3333, () => {
  console.log('Running on port 3333!')
});