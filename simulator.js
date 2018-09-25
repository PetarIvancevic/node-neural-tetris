import _ from 'lodash'

import constants from 'games/tetris/ai/constants'
import gameLogic from 'games/tetris/ai/gameLogic'
import TreeNode from 'games/tetris/ai/treeDataStructure'

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

  const possibleMoves = _.map(['left', 'right', 'rotate'], function (move) {
    return makeMove(_.cloneDeep(currentBlock), move)
  })
  possibleMoves.push(makeMove(_.cloneDeep(currentBlock), 'down', checkCollisionFn))

  return possibleMoves
}

function stripDuplicateMoves (newBlockMoves, allBlockMoveNodes) {
  const uniqueBlockMoves = []

  _.each(newBlockMoves, function (newBlockMove) {
    const duplicateBlock = _.find(allBlockMoveNodes, function (blockMoveNode) {
      return _.isEqual(blockMoveNode.block.occupiedPositions, newBlockMove.occupiedPositions)
    })

    if (!duplicateBlock) {
      uniqueBlockMoves.push(newBlockMove)
    }
  })

  return uniqueBlockMoves
}

function isFivePercentChance () {
  // generate random number
  // the chance of that number being 7 in this case is 5%
  // return false
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
    const parentMove = blockPositions.pop()
    const newMoves = generateMoves(parentMove, tetrisGame.getCheckCollisionFn())
    const newUniqueMoves = stripDuplicateMoves(newMoves, allMoveNodes)

    const uniqueMoveNodes = _.map(newUniqueMoves, function (uniqueMove) {
      const newChild = new TreeNode(null, uniqueMove)
      return newChild
    })

    allMoveNodes = _.concat(uniqueMoveNodes, allMoveNodes)
    blockPositions = _.concat(newUniqueMoves, blockPositions)
  }

  return allMoveNodes
}

function getFinalMoves (moveNodes) {
  return _(moveNodes).map(function (moveNode) {
    if (!moveNode.block.isMovable) {
      return moveNode
    }
  })
  .compact()
  .value()
}

function getBestMoveNode (tetrisGame, netConfig) {
  const finalMoves = getFinalMoves(generateAllMoveNodes(tetrisGame))
  let bestMoves = {moveValue: -100000, sameValueMoveIndexes: []}
  // add random function
  // WATCH OUT FOR BOARD VECTOR GENERATION!

  _.each(finalMoves, function (moveNode, index) {
    const board = tetrisGame.getBoard()

    const occupiedRows = gameLogic.populateLowestFourYCoordsFromOccupiedPositions(board)
    // BOARD CHANGED BY REFERENCE
    gameLogic.populateBoardWithActualMove(board, moveNode.block.occupiedPositions, constants.generic.FILLED_CELL_VALUE)

    const fullRowCount = gameLogic.getFullRowCount(board, occupiedRows)
    // reward is just calculating full rows or game lost
    const reward = gameLogic.getMoveValue(fullRowCount, _.min(occupiedRows))

    moveNode.setReward(reward)
    moveNode.setBoardVector(board, occupiedRows)
    // moveNode.board = _.cloneDeep(board)

    gameLogic.populateBoardWithActualMove(board, moveNode.block.occupiedPositions)

    const moveValue = reward + netConfig.net.run(moveNode.boardVector)[0]
    // let moveValue = netConfig.net.run(moveNode.boardVector)[0]

    if (moveValue === bestMoves.moveValue) {
      bestMoves.sameValueMoveIndexes.push(index)
    }

    if (moveValue > bestMoves.moveValue) {
      bestMoves = {
        moveValue,
        sameValueMoveIndexes: [index],
      }
    }
  })
  const bestMoveIndex = bestMoves.sameValueMoveIndexes[_.random(_.size(bestMoves.sameValueMoveIndexes) - 1)]

  if (isFivePercentChance()) {
    const randomIndex = _.random(_.size(finalMoves) - 1)
    return finalMoves[randomIndex]
  }

  return finalMoves[bestMoveIndex]
}

function playOneEpisode (tetrisGame, netConfig) {
  const allBestMoveNodes = []
  let gameMoves = 0

  while (!tetrisGame.isGameOver()) {
    const bestMoveNode = getBestMoveNode(tetrisGame, netConfig)

    if (!bestMoveNode || gameMoves > constants.ai.MAX_GAME_MOVES) {
      break
    }

    allBestMoveNodes.push(bestMoveNode)
    tetrisGame.AIAdvanceGame(bestMoveNode.block)
    gameMoves++
  }

  return allBestMoveNodes
}

export default {
  playOneEpisode,
}
