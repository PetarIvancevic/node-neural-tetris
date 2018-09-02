const _ = require('lodash')

const constants = require('../constants')
const gameLogic = require('./gameLogic')
const TreeNode = require('./treeDataStructure')
const explorationHelper = require('./explorationHelper')

function makeMove (currentBlock, move, checkCollisionFn) {
  if (move === 'right' || move === 'left') {
    currentBlock.move(move)
  } else if (move === 'down') {
    while (currentBlock.isMovable) {
      // The advance function will move the block down
      currentBlock.advance(checkCollisionFn)
    }
  } else if (move === 'rotate') {
    currentBlock.changeRotation()
  }

  return currentBlock
}

function generateMoves (currentBlock, checkCollisionFn) {
  if (!currentBlock.isMovable) {
    return []
  }
  const possibleMoves = []
  const possibleMovements = ['left', 'right', 'rotate']
  const possibleMovementsSize = _.size(possibleMovements)

  for (let i = 0; i < possibleMovementsSize; i++) {
    possibleMoves.push(makeMove(_.cloneDeep(currentBlock), possibleMovements[i]))
  }
  possibleMoves.push(makeMove(_.cloneDeep(currentBlock), 'down', checkCollisionFn))

  return possibleMoves
}

function stripDuplicateMoves (newBlockMoves, allBlockMoveNodes) {
  let uniqueBlockMoves = []

  for (let moveIndex = 0; moveIndex < _.size(newBlockMoves); moveIndex++) {
    let newBlockMove = newBlockMoves[moveIndex]

    let duplicateBlock = _.find(allBlockMoveNodes, function (blockMoveNode) {
      return _.isEqual(blockMoveNode.block.occupiedPositions, newBlockMove.occupiedPositions)
    })

    if (!duplicateBlock) {
      uniqueBlockMoves.push(newBlockMove)
    }
  }

  return uniqueBlockMoves
}

function isFivePercentChance () {
  // generate random number
  // the chance of that number being 7 in this case is 5%
  const isIt = _.random(19) === 7

  if (isIt) {
    console.log('5% PERCENT CHANCE MOVE!')
  }

  return isIt
}

function generateAllMoveNodes (tetrisGame) {
  let allMoveNodes = [new TreeNode(null, tetrisGame.getCurrentBlock())]
  let blockPositions = [_.cloneDeep(tetrisGame.getCurrentBlock())]

  while (_.size(blockPositions)) {
    let parentMove = blockPositions.pop()
    let newMoves = generateMoves(parentMove, tetrisGame.getCheckCollisionFn())
    let newUniqueMoves = stripDuplicateMoves(newMoves, allMoveNodes)

    let uniqueMoveNodes = []
    for (let uniqueMoveIndex = 0; uniqueMoveIndex < _.size(newUniqueMoves); uniqueMoveIndex++) {
      let uniqueMove = newUniqueMoves[uniqueMoveIndex]
      uniqueMoveNodes.push(new TreeNode(null, uniqueMove))
    }

    allMoveNodes = _.concat(uniqueMoveNodes, allMoveNodes)
    blockPositions = _.concat(newUniqueMoves, blockPositions)
  }

  return allMoveNodes
}

function getFinalMoves (moveNodes) {
  const finalMoveNodes = []

  for (let index = 0; index < _.size(moveNodes); index++) {
    let moveNode = moveNodes[index]

    if (!moveNode.block.isMovable) {
      finalMoveNodes.push(moveNode)
    }
  }

  return finalMoveNodes
}

function printBoardVector (boardVector) {
  let row = []

  console.log('---------BOARD VECTOR---------')
  for (let i = 0; i < constants.ai.ROW_COUNT * constants.ai.COLUMN_COUNT; i++) {
    row.push(boardVector[i])
    if ((i + 1) % constants.ai.ROW_COUNT === 0) {
      console.log(_.padStart(i, 2), JSON.stringify(row))
      row = []
    }
  }
  console.log('------END BOARD VECTOR-------')
}

function getBestMoveNode (tetrisGame, netConfig, useRandom, visitedMoveVectors) {
  const finalMoves = getFinalMoves(generateAllMoveNodes(tetrisGame))
  const numFinalMoves = _.size(finalMoves)
  let bestMoveIndex = 0
  let bestMoveValue = 0
  // add random function
  // WATCH OUT FOR BOARD VECTOR GENERATION!

  // console.log('MOVE COUNT', tetrisGame.getMoveCount())

  for (let index = 0; index < numFinalMoves; index++) {
    let moveNode = finalMoves[index]
    let board = tetrisGame.getBoard()

    // let occupiedRows = gameLogic.populateLowestFourYCoordsFromOccupiedPositions(board)
    // BOARD CHANGED BY REFERENCE
    gameLogic.populateBoardWithActualMove(board, moveNode.block.occupiedPositions, constants.generic.FILLED_CELL_VALUE)

    let fullRowCount = gameLogic.getFullRowCount(board)
    // reward is just calculating full rows or game lost
    // let reward = gameLogic.getMoveValue(fullRowCount)
    let reward = gameLogic.getMoveValueWithBetterHeuristics(board, tetrisGame.isGameOver())

    moveNode.setReward(reward)
    moveNode.setBoardVector(board)
    // moveNode.board = _.cloneDeep(board)

    gameLogic.populateBoardWithActualMove(board, moveNode.block.occupiedPositions)

    let explorationCoefficient = explorationHelper.isBoardVectorVisited(moveNode.boardVector, visitedMoveVectors) ? 0.3 : 1

    // let moveValue = reward + (netConfig.net.run(moveNode.boardVector)[0]) * explorationCoefficient
    let moveValue = reward + netConfig.net.run(moveNode.boardVector)[0]

    // printBoardVector(moveNode.boardVector)
    // console.log('Move value:', moveValue)

    if (_.isNaN(moveValue)) {
      console.log('Move value is NaN!', moveValue)
      process.exit(1)
    }

    if (moveValue > bestMoveValue) {
      bestMoveIndex = index
      bestMoveValue = moveValue
    }
  }

  if (useRandom && isFivePercentChance()) {
    let randomIndex = _.random(_.size(finalMoves) - 1)

    if (!finalMoves[randomIndex]) {
      return
    }

    finalMoves[randomIndex].setRandomMoveStatus(true)
    return finalMoves[randomIndex]
  }

  if (finalMoves[bestMoveIndex]) {
    explorationHelper.addUniqueMoveBoardVector(finalMoves[bestMoveIndex].boardVector, visitedMoveVectors)
  }

  return finalMoves[bestMoveIndex]
}

function playOneEpisode (tetrisGame, netConfig, useRandom = true, visitedMoveVectors = []) {
  const allBestMoveNodes = []
  let gameMoves = 0

  while (!tetrisGame.isGameOver()) {
    let bestMoveNode = getBestMoveNode(tetrisGame, netConfig, useRandom, visitedMoveVectors)

    if (!bestMoveNode || gameMoves > constants.ai.MAX_GAME_MOVES) {
      break
    }

    allBestMoveNodes.push(bestMoveNode)
    tetrisGame.AIAdvanceGame(bestMoveNode.block)
    gameMoves++
  }

  return allBestMoveNodes
}

module.exports = {
  playOneEpisode
}
