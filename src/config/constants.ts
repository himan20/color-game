import { DIFFICULTY_LEVEL } from '../enums/enums';

export const ERROR_MESSAGES = {
  // GE = Game engine error messages that we will log with our Logger
  GE: {
    invalid_difficulty: (data: number) => `Difficulty level ${data} is invalid : Expected values are : Easy : 0, Medium : 1, Difficult : 2`,
  },
  // USR = User-friendly messages that we will send back to the UI
  USR: {
    invalid_difficulty: 'Invalid Difficulty level selected',
    not_created: 'Could not load the Game. Refresh to try again',
  },
};

/**
 * Any string responses that we want to send to the UI are here for easily making tweaks
 * if required
 */
export const STRING_RESPONSES = {
  selected_difficulty : (data: string) => `Selected level is : ${data}`,
};

export const GRID_SIZE_FOR_DIFFICULTY_LEVEL = {
  [DIFFICULTY_LEVEL.EASY.toString()]: 3,
  [DIFFICULTY_LEVEL.MEDIUM.toString()]: 4,
  [DIFFICULTY_LEVEL.DIFFICULT.toString()]: 5,
};

// Separate const for no.of colors to keep it independent of the grid size
export const COLORS_FOR_DIFFICULTY_LEVEL = {
  [DIFFICULTY_LEVEL.EASY.toString()]: 3,
  [DIFFICULTY_LEVEL.MEDIUM.toString()]: 4,
  [DIFFICULTY_LEVEL.DIFFICULT.toString()]: 5,
};

export const MINIMUM_COLOR_WEIGHTAGE = 5;
