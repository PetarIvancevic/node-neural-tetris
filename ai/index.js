const _ = require('lodash')
const brain = require('brain.js')

const constants = require('../constants')
const simulator = require('./simulator')
const TetrisGame = require('../game')

const aiTrackers = {
  CURRENT_GAME: 0,
  TOTAL_SET_NUM_GAMES: 0
}

// async function writeMovesToFile (moves) {
//   const gameData = stripAllMovesData(moves[0])

//   await fetch('/api/write', { // eslint-disable-line
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify(gameData)
//   })
// }

// function stripMovesDataForNetworkUpdate (moves) {
//   return _.map(moves, function (moveData) {
//     return _.pick(moveData, ['boardVector', 'reward', 'output', 'numMoves'])
//   })
// }

// REWARD should be between 0 - 0.4
// because the net output is limited to 0.6  OLD
// function normalizeReward (reward) {
//   return reward ? reward / 100 : 0
// }

function printBoardVector (boardVector) {
  let row = []

  console.log('---------BOARD VECTOR---------')
  for (let i = 0; i < constants.ai.ROW_COUNT * constants.ai.COLUMN_COUNT; i++) {
    row.push(boardVector[i])
    if ((i + 1) % 10 === 0) {
      console.log(_.padStart(i, 2), JSON.stringify(row))
      row = []
    }
  }
  console.log('------END BOARD VECTOR-------')
}

function getVectorWithValues (fillVal = 0) {
  let arr = []

  for (let i = 0; i < constants.ai.VECTOR_ROW_COUNT * constants.ai.COLUMN_COUNT; i++) {
    arr.push(fillVal)
  }

  return arr
}

function normalizeReluOutput (output) {
  return output > 10 ? 10 : output
}

function updateNetwork (gameAllMoves, netConfig, shouldPrintBoardVector = false) {
  // const moves = stripMovesDataForNetworkUpdate(gameAllMoves)
  const moves = gameAllMoves
  const numMoves = _.size(moves)

  let oldRes = netConfig.net.run(getVectorWithValues())[0]
  const trainingSets = []
  let finalReward = 0

  const discountFactor = 0.85

  console.log('Training...')
  for (let i = 0; i < numMoves - 1; i++) {
    if (moves[i].reward > 0) {
      finalReward += moves[i].reward
    }

    // if (shouldPrintBoardVector) {
    //   printBoardVector(moves[i].boardVector)
    // }

    let currentNetStateNormalized = netConfig.netNormalizedOutput(moves[i].boardVector)[0]
    let reward = moves[i].reward
    let nextNetStateNormalized = netConfig.netNormalizedOutput(moves[i + 1].boardVector)[0]

    // let netOutput = currentNetStateNormalized + netConfig.learningRate * (reward + discountFactor * (nextNetStateNormalized) - currentNetStateNormalized)
    let netOutput = 0.1 + normalizeReluOutput(reward + discountFactor * nextNetStateNormalized)

    if (_.size(moves[i].boardVector) !== constants.ai.ROW_COUNT * constants.ai.COLUMN_COUNT) {
      console.log('nije', constants.ai.ROW_COUNT * constants.ai.COLUMN_COUNT)
      console.log(moves[i].boardVector)
    }

    trainingSets.push({
      boardVector: moves[i].boardVector,
      netOutput: [netOutput]
    })
  }

  netConfig.net.train(_.map(trainingSets, function (trainingSet) {
    return {
      input: trainingSet.boardVector,
      output: trainingSet.netOutput
    }
  }), {
    iterations: 1
  })

  console.log(`
    OLD: ${oldRes}
    NEW: ${netConfig.net.run(getVectorWithValues())[0]}
    NUMBER OF MOVES: ${numMoves}
    REWARD: ${finalReward}
  `)
}

/*
  BUTTON FUNCTIONS
*/

// global neural network
// let netConfig = {
//   net: null,
//   learningRate: 0.3,
//   netNormalizedOutput: function (input) {
//     // return this.net.run(input)
//     const netResult = this.net.run(input)
//     return netResult[0] > 10 ? [10] : netResult
//   }
// }

function create ({learningRate, hiddenLayers, activationFn, initialTrainingData, oldNetworkWeights}) {
  let netConfig = {
    netNormalizedOutput: function (input) {
      // return this.net.run(input)
      const netResult = this.net.run(input)
      return netResult[0] > 10 ? [10] : netResult[0] < 0 ? [0] : netResult
    }
  }

  if (oldNetworkWeights) {
    netConfig.net = new brain.NeuralNetwork({})
    netConfig.net.fromJSON(JSON.parse(oldNetworkWeights))
  } else {
    netConfig = _.assign({}, netConfig, {
      learningRate: _.toNumber(learningRate),
      net: new brain.NeuralNetwork({
        learningRate: _.toNumber(learningRate),
        activation: activationFn,
        hiddenLayers
      })
    })

    // initial train
    netConfig.net.train(initialTrainingData, {iterations: 1})
  }

  return netConfig
}

async function train (netConfig, currentGame, totalGames, shouldPrintBoardVector, useRandom, visitedMoveVectors) {
  if (!netConfig.net) {
    process.exit(1)
  }
  const chartData = []

  console.log(`Playing... GAME: ${currentGame} / ${totalGames}`)
  let tetrisGame = new TetrisGame(3, true)
  let gameMoveNodes = simulator.playOneEpisode(tetrisGame, netConfig, useRandom, visitedMoveVectors)

  chartData.push({
    totalPoints: tetrisGame.getScore(),
    netValuesBefore: {
      empty: netConfig.net.run(getVectorWithValues())[0],
      full: netConfig.net.run(getVectorWithValues(1))[0]
    },
    numMoves: _.size(gameMoveNodes)
  })

  if (_.size(gameMoveNodes) > 1) {
    updateNetwork(gameMoveNodes, netConfig, shouldPrintBoardVector)
  } else {
    console.log('INSTANT LOSS')
  }


  chartData[0].netValueAfter = {
    empty: netConfig.net.run(getVectorWithValues())[0],
    full: netConfig.net.run(getVectorWithValues(1))[0]
  }

  return chartData
}

function simulateTrainingGame (netConfig) {
  const allGameNodeMoves = []

  for (let i = 0; i < constants.ai.NUM_GAMES_TO_PLAY; i++) {
    allGameNodeMoves.push(simulator.playOneEpisode(new TetrisGame(3, true), netConfig, false))
  }

  return allGameNodeMoves
}

module.exports = {
  create,
  simulateTrainingGame,
  train
}
