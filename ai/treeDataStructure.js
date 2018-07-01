const _ = require('lodash')

const constants = require('../constants')
const gameLogic = require('./gameLogic')

function getBoardVector (board) {
  const boardVector = []
  const occupiedRows = gameLogic.populateLowestFourYCoordsFromOccupiedPositions(board)

  for (let row = 0; row < constants.ai.VECTOR_ROW_COUNT; row++) {
    for (let column = 0; column < constants.ai.COLUMN_COUNT; column++) {
      boardVector.push(board[column][row] ? 1 : 0)
    }
  }

  return boardVector
}

const TreeNode = function (parentNode, currentBlock) {
  this.children = []
  this.parent = parentNode
  this.block = _.cloneDeep(currentBlock)
  this.numMoves = 0
  this.reward = 0

  this.setNumMoves = function (numMoves) {
    this.numMoves = numMoves
  }

  this.addChild = function (childNode) {
    this.children.push(childNode)
  }

  this.setReward = function (reward) {
    this.reward = reward
  }

  this.setBoardVector = function (board) {
    const cleanedBoard = gameLogic.pushFullRowsDown(board)
    this.boardVector = getBoardVector(cleanedBoard)
  }
}

module.exports = TreeNode
