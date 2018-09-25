const _ = require('lodash')

function searchHelperFn (boardVector) {
  return function (alreadyVisitedMoveVector) {
    return _.isEqual(alreadyVisitedMoveVector, boardVector)
  }
}

function addUniqueMoveBoardVector (boardVector, visitedMovesVectors) {
  if (!isBoardVectorVisited(boardVector, visitedMovesVectors)) {
    visitedMovesVectors.push(boardVector)
  }
}

function isBoardVectorVisited (boardVector, visitedMovesVectors) {
  return !!_.find(visitedMovesVectors, searchHelperFn(boardVector))
}

module.exports = {
  addUniqueMoveBoardVector,
  isBoardVectorVisited,
}
