const _ = require('lodash')
const Promise = require('bluebird')
const fsPromise = Promise.promisifyAll(require('fs'))
const minimist = require('minimist')

const ai = require('./ai')
const consts = require('./constants')
const config = require('./config')

const trainingDataFolder = 'training-data'

const params = minimist(process.argv.slice(2), {
  stopEarly: true
})

function die () {
  process.exit(1)
}

function logAndDie (err) {
  console.error(err)
  die()
}

function validateParams () {
  const paramCount = _(params).keys().size()
  const hasProperParams = !!_(params).keys().difference(['_', 'games', 'name', 'g', 'n', 'c', 'continue']).size()

  if (paramCount < 3 || hasProperParams) {
    console.error(`
      The only valid params are "continue", "games" and "name"
      - continue  => continue training the network
      - games     => number of episodes to play
      - name      => name of the training data folder
      Example:
      node index.js --games 1000 --name first-training

      OR

      node index.js -g 1000 -n continue-training -c
    `)
    die()
  }

  const trainingCount = _.get(params, 'g') || _.get(params, 'games')
  const trainingFolderName = _.trim(_.get(params, 'n') || _.get(params, 'name'))
  const continueTraining = _.get(params, 'c') || _.get(params, 'continue')

  if (!_.isNumber(trainingCount)) {
    logAndDie('Count must be a number!')
  }

  if (!trainingFolderName) {
    logAndDie('Training folder name is required!')
  }

  params.v = {
    count: trainingCount,
    name: trainingFolderName,
    continueTraining
  }

  return true
}

async function createNewFolder (folderName) {
  return fsPromise.mkdirAsync(`${trainingDataFolder}/${folderName}`).catch(logAndDie)
}

/*
  Training data format
  {
    totalPoints     => total game points
    netValuesBefore
      - empty       => net value on empty board before training
      - full        => net value on full board before training
    numMoves        => total number of moves in game
    netValueAfter
      - empty       => net value on empty board after training
      - full        => net value on full board after training
  }
*/

async function writeTrainingDataToFiles (folderName, trainingData) {
  const folderPath = `${trainingDataFolder}/${folderName}`

  await fsPromise.appendFileAsync(`${folderPath}/points.txt`, `${trainingData.totalPoints}\n`)

  await fsPromise.appendFileAsync(`${folderPath}/net-before-training-empty.txt`, `${trainingData.netValuesBefore.empty}\n`)
  await fsPromise.appendFileAsync(`${folderPath}/net-before-training-full.txt`, `${trainingData.netValuesBefore.full}\n`)

  await fsPromise.appendFileAsync(`${folderPath}/total-moves.txt`, `${trainingData.numMoves}\n`)

  await fsPromise.appendFileAsync(`${folderPath}/net-after-training-empty.txt`, `${trainingData.netValueAfter.empty}\n`)
  await fsPromise.appendFileAsync(`${folderPath}/net-after-training-full.txt`, `${trainingData.netValueAfter.full}\n`)
}

async function writeNetworkToFile (folderName, trainedNetwork) {
  const networkFileName = `${trainingDataFolder}/${folderName}/network.json`

  return fsPromise.writeFileAsync(
    networkFileName,
    JSON.stringify(trainedNetwork.toJSON())
  ).catch(logAndDie)
}

async function writeSimulatedGameMovesToFile (folderName, moves) {
  console.log('Writing moves to file...')
  const networkFileName = `${trainingDataFolder}/${folderName}/game-moves.txt`

  for (let i = 0; i < _.size(moves); i++) {
    await fsPromise.appendFileAsync(
      networkFileName,
      `${JSON.stringify(moves[i])}\n`
    ).catch(logAndDie)
  }
}

async function readNetworkFromFile (folderName) {
  const networkJSON = await fsPromise.readFileAsync(`${trainingDataFolder}/${folderName}/network.json`, 'utf8')
  neuralNetwork.net = neuralNetwork.net.fromJSON(JSON.parse(networkJSON))
}

async function getPrevisitedVectorMoves (folderName) {
  const visitedMoveVectors = await fsPromise.readFileAsync(`${trainingDataFolder}/${folderName}/visited-moves-vector.txt`, 'utf8')
  return JSON.parse(visitedMoveVectors)
}

async function writePrevisitedMoves (folderName, visitedMoveVectors) {
  const folderPath = `${trainingDataFolder}/${folderName}/visited-moves-vector.txt`
  return fsPromise.writeFileAsync(folderPath, JSON.stringify(visitedMoveVectors))
}

async function setup (continueTraining, folderName) {
  if (!continueTraining) {
    await createNewFolder(folderName)
  } else {
    await readNetworkFromFile(folderName)
  }
}

async function trainNetwork (folderName, numGames, preVisitedMoveVectors) {
  const printBoardVectors = false

  let visitedMoveVectors = preVisitedMoveVectors || []
  let useRandom = true
  let currentVisitedSize = _.size(visitedMoveVectors)
  let sameSizeCount = 0

  await writeNetworkToFile(folderName, neuralNetwork.net)
  await writePrevisitedMoves(folderName, visitedMoveVectors)

  for (let gameNum = 0; gameNum < numGames; gameNum++) {
    let trainingData = _.first(await ai.train(neuralNetwork, gameNum + 1, numGames, printBoardVectors, useRandom, visitedMoveVectors))
    await writeTrainingDataToFiles(folderName, trainingData)
    let visitedMoveVectorsSize = _.size(visitedMoveVectors)
    console.log('Visited vector size:', visitedMoveVectorsSize, '/', consts.generic.VISITED_VECTOR_MAX_SIZE)

    if (visitedMoveVectorsSize > consts.generic.VISITED_VECTOR_MAX_SIZE) {
      console.log('CLEARED THE VISITED VECTOR!')
      visitedMoveVectors = []
    }

    if (currentVisitedSize === visitedMoveVectorsSize) {
      sameSizeCount++
    }

    if (gameNum % 2 === 0) {
      await writeNetworkToFile(folderName, neuralNetwork.net)
      await writePrevisitedMoves(folderName, visitedMoveVectors)
      // let simulatedGameMoves = await ai.simulateTrainingGame(neuralNetwork)
      // await writeSimulatedGameMovesToFile(folderName, simulatedGameMoves)
    }
  }
  await writeNetworkToFile(folderName, neuralNetwork.net)
  await writePrevisitedMoves(folderName, visitedMoveVectors)
  // await writeSimulatedGameMovesToFile(folderName, await ai.simulateTrainingGame(neuralNetwork))

  process.exit(0)
}

async function init ({continueTraining, name, count}) {
  await setup(continueTraining, name)
  const preVisitedMoveVectors = continueTraining ? await getPrevisitedVectorMoves(name) : []
  await trainNetwork(name, count, preVisitedMoveVectors)
  // const allGames = await ai.simulateTrainingGame(neuralNetwork)
}

if (!validateParams()) {
  die()
}

const neuralNetwork = ai.create(config)
init(params.v)
