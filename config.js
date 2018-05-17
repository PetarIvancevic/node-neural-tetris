const constants = require('./constants')

// neural network activation function
const activationFn = 'leaky-relu'

// neural network hidden layers
const hiddenLayers = [600, 50]

// neural network learning rate
const learningRate = 0.01

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
  activationFn,
  initialTrainingData: constructNetworkInitialData(),
  hiddenLayers,
  learningRate
}
