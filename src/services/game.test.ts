import GameService from './game';
import {
  ERROR_MESSAGES,
  STRING_RESPONSES,
  MINIMUM_COLOR_WEIGHTAGE,
 } from '../config/constants';
import { IReturnValue } from '../interfaces/IReturnValue';
import { DIFFICULTY_LEVEL } from '../enums/enums';
import { IColorOccurence } from '../interfaces/IColorOccurence';

describe('Check Service methods', () => {

  let service: GameService;

  beforeEach(() => {
    service = new GameService();
  });

  it('getRandomIntInclusive : make sure values returned are always in the range and inclusive of the range', () => {

    for (let i = 0; i < 100; i = i + 1) {
      const val = service.getRandomIntInclusive(0, 5);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThanOrEqual(5);
    }
  });

  it('startNewGame: check values returned : case Valid difficulty level', () => {
    const mockLevelData = {
      level: 1,
      size: 4,
      matrixSize: 16,
    };

    const grid = service.startNewGame({ level: mockLevelData.level });
    expect(grid).toHaveProperty('data');
    expect(grid).toHaveProperty('data.matrix');
    expect(grid).toHaveProperty('data.size');
    expect(grid.data?.matrix.length).toEqual(mockLevelData.matrixSize);
    expect(grid.data?.size).toEqual(mockLevelData.size);
  });

  it('startNewGame: check values returned : case Invalid difficulty level', () => {
    const mockLevelData = {
      level: 4,
    };

    const grid = service.startNewGame({ level: mockLevelData.level });
    expect(grid).toHaveProperty('isValid');
    expect(grid).toHaveProperty('message');
    expect(grid.isValid).toBeFalsy();
    expect(grid.message).toEqual(ERROR_MESSAGES.USR.invalid_difficulty);
  });

  it('checkDifficultyLevelIsValid: check proper messages are being returned when testing for validity - INVALID', () => {
    const returnValue = service.checkDifficultyLevelIsValid({ level: 4 });
    expect(returnValue).toHaveProperty('isValid');
    expect(returnValue).toHaveProperty('message');
    expect(returnValue.message).toEqual(ERROR_MESSAGES.USR.invalid_difficulty);
    expect(returnValue.isValid).toBeFalsy();
  });

  it('checkDifficultyLevelIsValid: check proper messages are being returned when testing for validity - VALID', () => {
    const level = 1;
    const returnValue = service.checkDifficultyLevelIsValid({ level });
    expect(returnValue).toHaveProperty('isValid');
    expect(returnValue).toHaveProperty('message');
    expect(returnValue.message)
    .toEqual(STRING_RESPONSES.selected_difficulty(DIFFICULTY_LEVEL[level].toString()));
    expect(returnValue.isValid).toBeTruthy();
    expect(returnValue.data).toEqual(level);
  });

  it('createGridOfDifficultyLevel: check proper response', () => {
    const mockLevelData = {
      level: 1,
      size: 4,
      matrixSize: 16,
    };
    const grid = service.createGridOfDifficultyLevel(mockLevelData.level);
    expect(grid).toHaveProperty('data');
    expect(grid).toHaveProperty('data.matrix');
    expect(grid).toHaveProperty('data.size');
    expect(grid.data?.matrix.length).toEqual(mockLevelData.matrixSize);
    expect(grid.data?.size).toEqual(mockLevelData.size);
  });

  it('getColorSetForGrid: check response contains unique colors and weightage total is 100', () => {
    const response = service.getColorSetForGrid(3);
    expect(response).toBeTruthy();
    expect(response.length).toEqual(3);
    expect(new Set(response.map(x => x.color)).size).toEqual(3);
    let total = 0;
    response.map(x => total += x.weightage);
    expect(total).toEqual(100);
  });

  it('getWeightage: weightage returned should always be more than minimum weightage and less than equal to total weightage supplied', () => {
    const weightage = service.getWeightage(100, 3, 1);
    for (let i = 0; i < 10; i = i + 1) {
      expect(weightage).toBeGreaterThanOrEqual(MINIMUM_COLOR_WEIGHTAGE);
      expect(weightage).toBeLessThanOrEqual(weightage);
    }
  });

  it('getWeightage: weightage for last index should always be equal to remaining weightage', () => {
    const weightage = service.getWeightage(50, 3, 2);
    for (let i = 0; i < 10; i = i + 1) {
      expect(weightage).toEqual(weightage);
    }
  });

  it('getRandomColor: method always appends to provided array with a new unique color', () => {
    const mockColors: number[] = [];
    for (let i = 0; i < 5; i = i + 1) {
      service.getRandomColor(mockColors);
    }

    expect(new Set(mockColors).size).toEqual(5);
  });

  it('generateRandomCell: generate colors for whole grid ensuring there are no duplicates', () => {
    const mockColorsGrid: IColorOccurence[] = [
      { color: 0, occurences: 3 },
      { color: 1, occurences: 3 },
      { color: 3, occurences: 3 },
    ];

    const generatedResults: number[] = [];
    for (let i = 0; i < 9; i = i + 1) {
      const result = service.generateRandomCell(mockColorsGrid);
      generatedResults.push(result);
    }

    expect(generatedResults.length).toEqual(9);
    expect(generatedResults.filter(x => x === 0).length).toEqual(3);
    expect(generatedResults.filter(x => x === 1).length).toEqual(3);
    expect(generatedResults.filter(x => x === 3).length).toEqual(3);
  });
});
