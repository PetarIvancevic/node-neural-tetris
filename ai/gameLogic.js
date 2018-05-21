const _ = require('lodash')

const constants = require('../constants')

function pushFullRowsDown (board, occupiedRows) {
  let tempGameBoard = _.cloneDeep(board)
  let sortedOccupiedRows = _.clone(occupiedRows)
  sortedOccupiedRows.sort()

  const BOARD_VECTOR_MAX_HEIGHT_INDEX = constants.ai.ROW_COUNT

  function boardHasFullRows () {
    // we are just working with 4 rows
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

/*
  From lowest Y coordinate create 4 rows so we can create a board vector later
*/

function getFirstRowIndex (board) {
  for (let row = 0; row < constants.ai.ROW_COUNT; row++) {
    for (let column = 0; column < 10; column++) {
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
      constants.ai.ROW_COUNT - 1
    ]
  } else {
    occupiedRows = [
      firstRowIndex,
      firstRowIndex + 1,
      firstRowIndex + 2,
      firstRowIndex + 3
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

function getFullRowCount (board, occupiedRows) {
  let fullRowCount = 0

  for (let i = 0; i < constants.ai.ROW_COUNT; i++) {
    let currentRow = occupiedRows[i]
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
  getMoveValue,
  getFullRowCount,
  pushFullRowsDown,
  populateLowestFourYCoordsFromOccupiedPositions,
  populateBoardWithActualMove
}
