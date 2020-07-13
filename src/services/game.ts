import Logger from '../loaders/logger';
import Joi from 'joi';
import {
  ERROR_MESSAGES, STRING_RESPONSES,
  GRID_SIZE_FOR_DIFFICULTY_LEVEL,
  COLORS_FOR_DIFFICULTY_LEVEL,
  MINIMUM_COLOR_WEIGHTAGE,
} from '../config/constants';
import { IReturnValue } from '../interfaces/IReturnValue';
import { IGrid } from '../interfaces/IGrid';
import { DIFFICULTY_LEVEL, COLORS } from '../enums/enums';
import { IColorWeightage } from '../interfaces/IColorWeightage';
import { IColorOccurence } from '../interfaces/IColorOccurence';
import { IGameStarterDto } from '../interfaces/IGameStarterDto';

export class GameService {

  /**
   * Starts a new game by generating a new unique Grid based on difficulty level chosen by player
   * @param data contains the player's chosen level ID
   */
  startNewGame = (data: IGameStarterDto): IReturnValue<IGrid> => {
    const levelValidity: IReturnValue<number> = this.checkDifficultyLevelIsValid(data);
    let returnValue: IReturnValue<IGrid> = {};

    if (!levelValidity.isValid || (levelValidity.data !== 0 && !levelValidity.data)) {
      returnValue.isValid = false;
      returnValue.message = levelValidity.message;
      return returnValue;
    }

    returnValue = this.createGridOfDifficultyLevel(levelValidity.data);

    return returnValue;
  }

  /**
   * Uses Joi to validate the level chosen by player
   * @param data object that contains level ID information
   */
  checkDifficultyLevelIsValid = (data: IGameStarterDto): IReturnValue<number> => {
    const returnValue: IReturnValue<number> = {};
    const schema = Joi.object().keys({
      level: Joi.number().required().min(0).max(2),
    });

    Joi.validate(data, schema, (err, result) => {
      returnValue.isValid = false;
      if (err) {
        Logger.error(ERROR_MESSAGES.GE.invalid_difficulty(data?.level));
        returnValue.message = ERROR_MESSAGES.USR.invalid_difficulty;
      } else {
        returnValue.isValid = true;
        returnValue.message = STRING_RESPONSES.
        selected_difficulty(DIFFICULTY_LEVEL[data.level].toString());
        returnValue.data = data?.level;
      }
    });
    return returnValue;
  }

  /**
   * Returns the final Grid data that will represent the whole grid based on
   * chosen difficulty level, the no.of colors to be represented and the weightage
   * for each color
   * @param level difficulty level chosen by the user when starting the game
   */
  createGridOfDifficultyLevel = (level: number): IReturnValue<IGrid> => {
    const returnValue: IReturnValue<IGrid> = {};

    const gridSize = GRID_SIZE_FOR_DIFFICULTY_LEVEL[level.toString()];

    const arrMatrix = [];

    const noOfColors = COLORS_FOR_DIFFICULTY_LEVEL[level.toString()];

    /**
     * The matrix gets a no.of colors based on difficulty.
     * The colors chosen shall be unique so we 1st choose the colors we want in the grid.
     * Once we have the colors, each of them should get a weightage assigned at random
     * so that the generated grid is unique each time and contains all the chosen colors.
     * The weightages should total to a 100% so we adequately fill the grid.
     */
    const colors = this.getColorSetForGrid(noOfColors);

    /**
     * this colors object contains data as IColorWeightage
     * we need to convert it to IColorOccurence
     * NOTE: we could have directly returned IColorOccurence from the getColorSetForGrid method
     * However, returning weightages and then transforming them to occurences
     * may allow us to easily change this piece of logic separately in the future
     */
    const colorsGrid: IColorOccurence[] = [];
    const flatGridSize = gridSize * gridSize;

    colors.map((item: any, index: number) => {
      if (index < colors.length - 1) {
        const occurs = Math.ceil(flatGridSize * item.weightage / 100);
        colorsGrid.push({ color: item.color, occurences: occurs });
      } else {
        let totalOccurences = 0;
        colorsGrid.map(gridItem => totalOccurences += gridItem.occurences);
        const occurencesLeft = flatGridSize - totalOccurences;
        colorsGrid.push({ color: item.color, occurences: occurencesLeft });
      }
    });

    /**
     * since we will always deal with square matrices in this Game,
     * we can create the square matrix with n * n
     */
    for (let i = 0; i < (gridSize * gridSize); i = i + 1) {
      const cellColor = this.generateRandomCell(colorsGrid);
      arrMatrix.push(cellColor);
    }

    // todo: Save matrix to DB

    returnValue.data = { matrix: arrMatrix, size: gridSize };
    returnValue.isValid = true;
    return returnValue;
  }

  /**
   * Generates the set of colors and their weightages that will fill the grid
   * @param noOfColors
   */
  getColorSetForGrid = (noOfColors: number): IColorWeightage[] => {
    const colors: number[] = [];
    const colorsWithWeights: IColorWeightage[] = [];
    let weightage = 100;
    for (let i = 0; i < noOfColors; i = i + 1) {
      this.getRandomColor(colors);
      const colorWeight = this.getWeightage(weightage, noOfColors, i);
      weightage = weightage - colorWeight;
      colorsWithWeights.push({ color: colors[i], weightage: colorWeight });
    }
    return colorsWithWeights;
  }

  /**
   * Generates a weightage for each color while still keeping room for each color to have
   * a minimum weightage
   * @param weightage total weightage remaining for set of colors
   * @param noOfColors total number of colors in grid
   * @param index current index in series for which weightage is required
   */
  getWeightage = (weightage: number, noOfColors: number, index: number): number => {
    if (index < noOfColors - 1) {
      const max = weightage - (MINIMUM_COLOR_WEIGHTAGE * (noOfColors - (index + 1)));
      return this.getRandomIntInclusive(MINIMUM_COLOR_WEIGHTAGE, max);
    }

    return weightage;
  }

  /**
   * Generates a new color and makes sure that color is not already present
   * in the colors array passed as argument
   * @param colors array representing current set of colors
   */
  getRandomColor = (colors: number[]) => {
    /**
     * WARNING:
     * if the number of colors in the system are less than the noOfColors for the grid
     * then there is a risk of the getRandomColor running in an endless loop
     * since it will never find the next unique color to append to colors array
     * so we need to make sure that max value in COLORS_FOR_DIFFICULTY_LEVEL matches
     * with the no.of COLORS (enum) (currently both are 5)
     */

    // Fix: enum always returns length as actual no.of entries * 2 ~ weird
    const totalNumberOfColorsInSystem = Object.entries(COLORS).length / 2;

    const newColor = this.getRandomIntInclusive(0, totalNumberOfColorsInSystem - 1);
    if (colors.findIndex(color => color === newColor) > -1) {
      this.getRandomColor(colors);
    } else {
      colors.push(newColor);
    }
  }

  /**
   * Generates a random number in the range of min and max values inclusive of both min and max
   * @param min
   * @param max
   */
  getRandomIntInclusive = (min: number, max: number): number => {
    const newMin = Math.ceil(min);
    const newMax = Math.floor(max);
    // The maximum is inclusive and the minimum is inclusive
    return Math.floor(Math.random() * (newMax - newMin + 1)) + newMin;
  }

  /**
   * Generates a single cell that will be rendered in the grid.
   * Single cell value represents the color that the cell will have
   * @param colorsGrid array of type IColorOccurence
   */
  generateRandomCell = (colorsGrid: IColorOccurence[]): number => {
    const index = this.getRandomIntInclusive(0, colorsGrid.length - 1);
    let selectedColor;
    if (colorsGrid[index].occurences <= 1) {
      selectedColor = colorsGrid[index].color;
      colorsGrid.splice(index, 1);
    } else {
      selectedColor = colorsGrid[index].color;
      colorsGrid[index].occurences -= 1;
    }
    return selectedColor;
  }
}

export default GameService;
