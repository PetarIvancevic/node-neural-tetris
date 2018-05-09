const _ = require('lodash')
const Promise = require('bluebird')
const fsPromise = Promise.promisifyAll(require('fs'))
const minimist = require('minimist')

const ai = require('./ai')
const config = require('./config')

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
  const hasProperParams = !!_(params).keys().difference(['_', 'count', 'name', 'c', 'n']).size()

  if (paramCount < 3 || hasProperParams) {
    console.error(`
      The only valid params are "count" and "name"
      - count => number of episodes to play
      - name  => name of the training data folder
      Example:
      node index.js --count 1000 --name first-training

      OR

      node index.js -c 1000 -n first-training
    `)
    die()
  }

  const trainingCount = _.get(params, 'c') || _.get(params, 'count')
  const trainingFolderName = _.trim(_.get(params, 'n') || _.get(params, 'name'))

  if (!_.isNumber(trainingCount)) {
    console.error('Count must be a number!')
    die()
  }

  params.v = {
    count: trainingCount,
    name: trainingFolderName
  }

  return true
}

async function createNewFolder (folderName) {
  return fsPromise.mkdirAsync(`training-data/${folderName}`).catch(logAndDie)
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
  const folderPath = `training-data/${folderName}`

  await fsPromise.appendFileAsync(`${folderPath}/points.txt`, `${trainingData.totalPoints}\n`)

  await fsPromise.appendFileAsync(`${folderPath}/net-before-training-empty.txt`, `${trainingData.netValuesBefore.empty}\n`)
  await fsPromise.appendFileAsync(`${folderPath}/net-before-training-full.txt`, `${trainingData.netValuesBefore.full}\n`)

  await fsPromise.appendFileAsync(`${folderPath}/total-moves.txt`, `${trainingData.numMoves}\n`)

  await fsPromise.appendFileAsync(`${folderPath}/net-after-training-empty.txt`, `${trainingData.netValueAfter.empty}\n`)
  await fsPromise.appendFileAsync(`${folderPath}/net-after-training-full.txt`, `${trainingData.netValueAfter.full}\n`)
}

async function writeNetworkToFile (folderName, trainedNetwork) {
  const networkFileName = `training-data/${folderName}/network.json`

  return fsPromise.writeFileAsync(
    networkFileName,
    JSON.stringify(trainedNetwork.toJSON())
  ).catch(logAndDie)
}

async function trainNetwork (folderName, numGames) {
  await createNewFolder(folderName)

  for (let gameNum = 0; gameNum < numGames; gameNum++) {
    let trainingData = _.first(await ai.train(neuralNetwork, gameNum + 1, numGames))
    await writeTrainingDataToFiles(folderName, trainingData)
  }
  await writeNetworkToFile(folderName, neuralNetwork.net)

  process.exit(0)
}

if (!validateParams()) {
  die()
}

const neuralNetwork = ai.create(config)
trainNetwork(params.name, params.count)
