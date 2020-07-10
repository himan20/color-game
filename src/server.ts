
import app from './app';
import { config } from './config';
import Logger from './loaders/logger';

app.listen(config.port, () => {
  // tslint:disable-next-line: no-console
  Logger.info(`Started listening to port ${config.port}`);
});
