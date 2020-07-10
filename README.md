# RUNNING THE APP
If you are using VSCode, the project already contains a launch.json file that you can use.

In any case, the API can be run with the following command:

  ```
  npm run dev
  ```

The project uses Linux's fuser command to kill the port the API is running on if it crashes (fix for nodemon port issue). If you are running this API on a Windows environment, you can either comment out the fuser command in nodemon.json file or provide a windows command to kill the port 5000.

If you still run into nodemon port issues, try killing the port 5000 manually and re-running the API.

# ARCHITECTURE CHOICES
  1. The folder structure has been created with separation of concerns in mind.

      Folder structure:
      ```
      ---src
        |___ config -- contains all config related data fetched from env file
        |___ enums -- typescript enums
        |___ interfaces -- common interfaces used throughout
        |___ loaders -- loaders that are used for middlewares
        |___ middlewares -- any custom middlewares can go here
        |___ models -- DB models go here
        |___ repositories -- DB access layer
        |___ routes -- separation of individual routes
        |___ services -- services with business logic
      ```

  2. Running the application in development with nodemon hot reloading
  3. Added tslint with specific configurations. Using airbnb style guide as base.
  4. Winston for logging purposes.
  5. Added editorconfig file to make sure the airbnb style guide for 2 spaces indentation can be followed easily by all team members.
  6. Use of config file instead of process.ENV variables in the application
  7. app.ts and server.ts have been separated out for testing purposes
  8. Using Joi for input validations on server side

# GAME ENGINE LOGIC

1. We start off with the /start api where, the user chooses the difficulty level he wants to play at.
2. Based on the difficulty level, we generate the Grid that the user sees :

      EASY : 3 x 3 grid with 3 colors

      MEDIUM : 4 x 4 grid with 4 colors

      DIFFICULT : 5 x 5 grid with 5 colors

3. Based on the above grid size, we will send back the user a flat array of cells that needs to be rendered on the UI as a Grid. Each cell will have its color property. When cells are mapped on the FrontEnd, each cell will know its own row column combination and color (will be used in Greedy algorithm). This grid data will be saved to our database under the game events collection.
4. The game events collection will also have a *Turns* array property. This will continue to get appended to until the user finishes the game. Every color that the user chooses in his next turn will be saved in this array. This will allow us to have a structure that can replay the events of that game if required and also output the turns that the user took at the end of the Game as summary.

# IMPROVEMENTS:
1. Use TypeDI for dependency injection
2. Add tests for service methods
3. Store each game in the DB and append turns to that game till it finishes
4. Implement a UI for the Grid and choosing next color - game start screen with difficulty levels, game end screen with summary and new game buttons
5. Implement AI player that uses the Greedy algorithm to run the game on its own

