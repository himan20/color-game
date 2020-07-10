import { Application } from 'express';
import example from './game';

export const router = (app: Application) => {
  app.use('/', example);
};
