import Logger from '../loaders/logger';
import Joi from 'joi';
import {
  ERROR_MESSAGES, STRING_RESPONSES,
  GRID_SIZE_FOR_DIFFICULTY_LEVEL,
  COLORS_FOR_DIFFICULTY_LEVEL,
  MINIMUM_COLOR_WEIGHTAGE,
} from '../config/constants';
import { IReturnValue } from '../interfaces/IReturnValue';
import { DIFFICULTY_LEVEL, COLORS } from '../enums/enums';

export class GameService {

  checkDifficultyLevelIsValid = (data: any): IReturnValue => {
    const returnValue: IReturnValue = {};
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

  startNewGame = (data: any): IReturnValue => {
    let returnValue: IReturnValue = this.checkDifficultyLevelIsValid(data);
    if (!returnValue.isValid) {
      return returnValue;
    }

    returnValue = this.createGridOfDifficultyLevel(returnValue.data);

    return returnValue;
  }

  createGridOfDifficultyLevel = (data: number): IReturnValue => {
    const returnValue: IReturnValue = {};

    const gridSize = GRID_SIZE_FOR_DIFFICULTY_LEVEL[data.toString()];

    const arrMatrix = [];

    /**
     * The matrix gets a no.of colors based on difficulty.
     * The colors chosen shall be unique so we 1st choose the colors we want in the grid.
     * Once we have the colors, each of them should get a weightage assigned at random
     * so that the generated grid is unique each time.
     * The weightages should total to a 100% so we adequately fill the grid.
     */

    const noOfColors = COLORS_FOR_DIFFICULTY_LEVEL[data.toString()];

    const colors = this.getColorSetForGrid(noOfColors);

    /**
     * this colors object contains data as { color, weightage }
     * we need to convert it to color and the no.of times it occurs based on the grid size
     * Note: we could have returned directly the no.of occurences from the getColorSetForGrid method
     * However, returning weightages and then transforming them to occurences
     * may allow us to easily change this piece of logic separately in the future
     */
    const colorsGrid: any[] = [];
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

  getColorSetForGrid = (noOfColors: number): any[] => {
    const colors: number[] = [];
    const colorsWithWeights = [];
    let weightage = 100;
    for (let i = 0; i < noOfColors; i = i + 1) {
      this.getRandomColor(colors);
      const colorWeight = this.getWeightage(weightage, noOfColors, i);
      weightage = weightage - colorWeight;
      colorsWithWeights.push({ color: colors[i], weightage: colorWeight });
    }
    return colorsWithWeights;
  }

  getWeightage = (weightage: number, noOfColors: number, index: number): number => {
    // For generating a truly unique grid, we still need to make sure that each of the colors
    // are part of the grid.
    // Hence, each color must have a random weightage.
    // However, the weightage should still leave room for other colors to have
    // at least the minimum weightage
    if (index < noOfColors - 1) {
      const max = weightage - (MINIMUM_COLOR_WEIGHTAGE * (noOfColors - (index + 1)));
      return this.getRandomIntInclusive(MINIMUM_COLOR_WEIGHTAGE, max);
    }

    return weightage;
  }

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

  getRandomIntInclusive = (min: number, max: number): number => {
    const newMin = Math.ceil(min);
    const newMax = Math.floor(max);
    // The maximum is inclusive and the minimum is inclusive
    return Math.floor(Math.random() * (newMax - newMin + 1)) + newMin;
  }

  generateRandomCell = (colorsGrid: any): number => {
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
