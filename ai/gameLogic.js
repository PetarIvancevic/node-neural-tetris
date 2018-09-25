const _ = require('lodash')

const constants = require('../constants')

function pushFullRowsDown (board) {
  const tempGameBoard = _.cloneDeep(board)

  const BOARD_VECTOR_MAX_HEIGHT_INDEX = constants.ai.ROW_COUNT

  function boardHasFullRows () {
    for (let row = BOARD_VECTOR_MAX_HEIGHT_INDEX; row >= 0; row--) {
      let rowIsFull = true

      for (let column = 0; column < constants.ai.COLUMN_COUNT; column++) {
        if (!tempGameBoard[column][row]) {
          rowIsFull = false
          break
        }
      }

      if (rowIsFull) {
        return true
      }
    }

    return false
  }

  function pushRowsDownFromIndex (rowIndex) {
    for (let column = 0; column < constants.ai.COLUMN_COUNT; column++) {
      delete tempGameBoard[column][rowIndex]
    }

    for (let row = rowIndex; row > 0; row--) {
      for (let column = 0; column < constants.ai.COLUMN_COUNT; column++) {
        tempGameBoard[column][row] = tempGameBoard[column][row - 1]
      }
    }

    for (let column = 0; column < constants.ai.COLUMN_COUNT; column++) {
      tempGameBoard[column][0] = null
    }
  }

  while (boardHasFullRows()) {
    for (let row = BOARD_VECTOR_MAX_HEIGHT_INDEX; row >= 0; row--) {
      let isRowFull = true

      for (let column = 0; column < constants.ai.COLUMN_COUNT; column++) {
        if (!tempGameBoard[column][row]) {
          isRowFull = false
        }
      }

      if (isRowFull) {
        pushRowsDownFromIndex(row)
        row++
      }
    }
  }

  return tempGameBoard
}

/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

function getMoveValue (fullRowCount, minimalRowIndex) {
  return fullRowCount * 1
}

// function getHoleCoefficient (board) {
//   let numHoles = 0

//   for (let column = 0; column < constants.ai.COLUMN_COUNT; column++) {
//     const indexOfHole = _.findLastIndex(board[column], function (boardBlock) { return !boardBlock })
//     const indexOfHighestBlock = _.findIndex(board[column], function (boardBlock) { return boardBlock })

//     if (indexOfHole > indexOfHighestBlock && indexOfHighestBlock !== -1) {
//       numHoles++
//     }
//   }

//   return (numHoles / constants.ai.COLUMN_COUNT) / 1.7
// }

// function getHeightCoefficient (board) {
//   let heightCoefficient = 0

//   for (let column = 0; column < constants.ai.COLUMN_COUNT; column++) {
//     const indexOfHighestBlock = _.findIndex(board[column], function (boardBlock) { return boardBlock })

//     if (indexOfHighestBlock !== -1) {
//       heightCoefficient += (indexOfHighestBlock / (constants.ai.COLUMN_COUNT * constants.ai.ROW_COUNT))
//     }
//   }

//   return (heightCoefficient / constants.ai.COLUMN_COUNT)
// }

function getMoveValueWithBetterHeuristics (board, isGameOver) {
  if (isGameOver) {
    return 0
  }
  const fullRowCount = getFullRowCount(board)

  return fullRowCount * 1

  // old ideas
  // const holeCoefficient = getHoleCoefficient(board)
  // const heightCoefficient = getHeightCoefficient(board)

  // const moveValue = (fullRowCount * 1) - holeCoefficient + heightCoefficient

  // return moveValue > 0 ? moveValue : 0
}

/*
  From lowest Y coordinate create 4 rows so we can create a board vector later
*/

function getFirstRowIndex (board) {
  for (let row = 0; row < constants.ai.ROW_COUNT; row++) {
    for (let column = 0; column < constants.ai.COLUMN_COUNT; column++) {
      if (board[column][row]) {
        return row
      }
    }
  }

  return constants.ai.ROW_COUNT
}

function populateLowestFourYCoordsFromOccupiedPositions (board) {
  const firstRowIndex = getFirstRowIndex(board)
  let occupiedRows = []

  if (firstRowIndex > constants.ai.ROW_COUNT - 4) {
    occupiedRows = [
      constants.ai.ROW_COUNT - 4,
      constants.ai.ROW_COUNT - 3,
      constants.ai.ROW_COUNT - 2,
      constants.ai.ROW_COUNT - 1,
    ]
  } else {
    occupiedRows = [
      firstRowIndex,
      firstRowIndex + 1,
      firstRowIndex + 2,
      firstRowIndex + 3,
    ]
  }

  return occupiedRows
}

/*
  Board is updated by REFERENCE
*/
function populateBoardWithActualMove (board, occupiedPositions, value) {
  for (let i = 0; i < _.size(occupiedPositions); i++) {
    if (value) {
      board[occupiedPositions[i].x][occupiedPositions[i].y] = value
    } else {
      delete board[occupiedPositions[i].x][occupiedPositions[i].y]
    }
  }
}

function getFullRowCount (board) {
  let fullRowCount = 0

  for (let currentRow = 0; currentRow < constants.ai.ROW_COUNT; currentRow++) {
    let rowIsFull = true

    for (let column = 0; column < constants.ai.COLUMN_COUNT; column++) {
      if (!board[column][currentRow]) {
        rowIsFull = false
        break
      }
    }

    if (rowIsFull) {
      fullRowCount++
    }
  }

  return fullRowCount
}

module.exports = {
  getFullRowCount,
  getMoveValue,
  getMoveValueWithBetterHeuristics,
  populateBoardWithActualMove,
  populateLowestFourYCoordsFromOccupiedPositions,
  pushFullRowsDown,
}
