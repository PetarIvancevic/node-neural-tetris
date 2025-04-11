const constants = require('./constants')

// neural network activation function
/*
  Available activation functions:
    - leaky-relu
    - relu
    - sigmoid
*/
const activationFn = 'leaky-relu'

/*
  Neural network hidden layers
  Every element of the array defines the number of neurons for that layer.
*/
const hiddenLayers = [50, 20]

// neural network learning rate
const learningRate = 0.02

const learnedRewardNum = 5000

/*
  Should the network use random moves
  If set to false the network might not learn the best actions.
  This parameter will be turned off when the network has been trained.
*/
const useRandom = true

/*
  Should the network be trained or not. Probably wise to leave it set to "true"
*/
const shouldTrainNetwork = true

/*
  Which block should be used for the game
  Available block values:
    - LBlock
    - JBlock
    - IBlock
    - OBlock
    - SBlock
    - ZBlock
    - TBlock
    - false  => this means to use all the fixed blocks
*/
const fixedBlock = false

/*
  This parameter defines the number of moves when the user thinks the bot has learned.
  After the bot has made "learnedMoveCount" actions then the training will stop to see
  if it has truly learned how to play.
*/
const learnedMoveCount = 100

function constructNetworkInitialData (input, output) {
  const initialData = [{
    input: [],
    output: [10],
  }, {
    input: [],
    output: [0],
  }]
  const vectorSize = constants.ai.COLUMN_COUNT * constants.ai.VECTOR_ROW_COUNT

  for (let i = 0; i < vectorSize; i++) {
    initialData[0].input.push(0)
    initialData[1].input.push(1)
  }

  return initialData
}

module.exports = {
  activationFn,
  useRandom,
  fixedBlock,
  learnedMoveCount,
  shouldTrainNetwork,
  learnedRewardNum,
  initialTrainingData: constructNetworkInitialData(),
  hiddenLayers,
  learningRate,
}
