# Node neural tetris
A simple tetris bot created with a neural network and reinforcement learning. Everyting is written using nodejs.

## Game
Every game has been fixated to 501 blocks so it is easier to track the learning process. Every block is generated at a random location (at the top) with random orientation. When generating all possible moves the block is moved left, right and permutated on the current height. Once all combination have been generated the blocks are lowered down. The blocks will not be slided into places if there is another block above it. (This makes the training a lot harder)

## Running the bot
Running the bot requires two parameters:
g - Number of games to play
n - Name of the folder where the generated data will be stored

Example:
```bash
node index.js -g NUM_GAMES -n NAME_OF_FOLDER
```

The `config.js` file contains all the configuration parameters. Freely update any parameter to see how the network behaves.

If there are any issues please open a issue so I can fix it :)
