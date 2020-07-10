import { Request, Response, Router } from 'express';
import { DIFFICULTY_LEVEL } from '../enums/enums';
import { ERROR_MESSAGES, STRING_RESPONSES } from '../config/constants';
import GameService from '../services/game';

const route = Router();

route.post('/start', async (req: Request, res: Response) => {
  const service = new GameService();
  const returnValue = service.startNewGame(req?.body);
  if (!returnValue.isValid) {
    res.status(404).send({ error: returnValue.message });
  } else {
    res.status(200).send(returnValue);
  }

  // const returnValue = await service.startNewGame(req?.body);
  // if (!returnValue?.isValid) {
  //   res.send({ error: ERROR_MESSAGES.USR.not_created });
  // } else {
  //   res.send(returnValue.grid);
  // }

});

// route.get('/create', async (req: Request, res: Response) => {
//   const service = new GameService();
// })

export default route;
