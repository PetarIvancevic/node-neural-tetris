const constants = require('./constants')

// neural network activation function
const activationFn = 'leaky-relu'

// neural network hidden layers
const hiddenLayers = [800, 100]
 // const hiddenLayers = [700, 300]

// neural network learning rate
const learningRate = 0.1

const learnedRewardNum = 5000

// this also means that the network won't learn
const useRandom = true

const shouldTrainNetwork = true

const fixedBlock = false

const maxMoveCount = 50

const averageBlocksForFullRow = 5

function constructNetworkInitialData (input, output) {
  const initialData = [{
    input: [],
    output: [10]
  }, {
    input: [],
    output: [0]
  }]
  const vectorSize = constants.ai.COLUMN_COUNT * constants.ai.VECTOR_ROW_COUNT

  for (let i = 0; i < vectorSize; i++) {
    initialData[0].input.push(0)
    initialData[1].input.push(1)
  }

  return initialData
}

module.exports = {
  averageBlocksForFullRow,
  activationFn,
  useRandom,
  fixedBlock,
  maxMoveCount,
  shouldTrainNetwork,
  learnedRewardNum,
  initialTrainingData: constructNetworkInitialData(),
  hiddenLayers,
  learningRate
}
