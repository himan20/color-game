import express, { Application, Request, Response } from 'express';
import { router } from './routes/index';
import { loader } from './loaders/index';
import { config } from './config';
import Logger from './loaders/logger';

const app: Application = express();
loader(app);
router(app);

export default app;
