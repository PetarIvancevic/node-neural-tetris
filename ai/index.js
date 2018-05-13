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
  // console.log(JSON.stringify(boardVector))
  let row = []

  for (let i = 0; i < constants.ai.ROW_COUNT * constants.ai.COLUMN_COUNT; i++) {
    row.push(boardVector[i])
    if ((i + 1) % 10 === 0) {
      console.log(i, JSON.stringify(row))
      row = []
    }
  }
}

function getVectorWithValues (fillVal = 0) {
  let arr = []

  for (let i = 0; i < constants.ai.VECTOR_ROW_COUNT * constants.ai.COLUMN_COUNT; i++) {
    arr.push(fillVal)
  }

  return arr
}

function updateNetwork (gameAllMoves, netConfig) {
  // const moves = stripMovesDataForNetworkUpdate(gameAllMoves)
  const moves = gameAllMoves
  const numMoves = _.size(moves)

  let oldRes = netConfig.net.run(getVectorWithValues())
  const trainingSets = []
  let finalReward = 0

  const discountFactor = 0.85

  console.log('Training...')
  for (let i = 0; i < numMoves - 1; i++) {
    if (moves[i].reward >= 0) {
      finalReward += moves[i].reward
    }

    // printBoardVector(moves[i].boardVector)

    trainingSets.push({
      boardVector: moves[i].boardVector,
      netOutput: [0.1 + moves[i].reward + discountFactor * netConfig.netNormalizedOutput(moves[i + 1].boardVector)[0]]
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
      return netResult[0] > 10 ? [10] : netResult
    }
  }

  if (oldNetworkWeights) {
    netConfig.net = new brain.NeuralNetwork({})
    netConfig.net.fromJSON(JSON.parse(oldNetworkWeights))
  } else {
    netConfig = _.assign({}, netConfig, {
      net: new brain.NeuralNetwork({
        learningRate: _.toNumber(learningRate || netConfig.learningRate),
        activation: activationFn,
        hiddenLayers
      })
    })

    // initial train
    netConfig.net.train(initialTrainingData, {iterations: 1})
  }

  return netConfig
}

async function train (netConfig, currentGame, totalGames) {
  if (!netConfig.net) {
    process.exit(1)
  }

  const NUM_GAMES_TO_PLAY = 1 // numGames || aiTrackers.NUM_GAMES_TO_PLAY
  const chartData = []

  aiTrackers.TOTAL_SET_NUM_GAMES = NUM_GAMES_TO_PLAY
  aiTrackers.CURRENT_GAME = 0

  for (let i = 0; i < NUM_GAMES_TO_PLAY; i++) {
    console.log(`Playing... GAME: ${currentGame} / ${totalGames}`)
    aiTrackers.CURRENT_GAME++
    let tetrisGame = new TetrisGame(3, true)
    let gameMoveNodes = simulator.playOneEpisode(tetrisGame, netConfig)

    chartData.push({
      totalPoints: tetrisGame.getScore(),
      netValuesBefore: {
        empty: netConfig.net.run(getVectorWithValues())[0],
        full: netConfig.net.run(getVectorWithValues(1))[0]
      },
      numMoves: _.size(gameMoveNodes)
    })
    updateNetwork(gameMoveNodes, netConfig)

    chartData[i].netValueAfter = {
      empty: netConfig.net.run(getVectorWithValues())[0],
      full: netConfig.net.run(getVectorWithValues(1))[0]
    }
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
