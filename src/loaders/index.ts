import { Application } from 'express';
import bodyParser from 'body-parser';

export const loader = (app: Application) => {
  app.use(bodyParser.json());
};
