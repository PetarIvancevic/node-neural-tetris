const tetris = {
  blockTypes: {
    IBlock: 'IBlock',
    JBlock: 'JBlock',
    LBlock: 'LBlock',
    OBlock: 'OBlock',
    SBlock: 'SBlock',
    TBlock: 'TBlock',
    ZBlock: 'ZBlock'
  },
  blockTypeColors: {
    IBlock: '#C7E437',
    JBlock: '#5DE14D',
    LBlock: '#3D8ABA',
    OBlock: '#934FAD',
    SBlock: '#B03013',
    TBlock: '#EF7BB9',
    ZBlock: '#FC6601'
  }
}


const ai = {
  COLUMN_COUNT: 10,
  ROW_COUNT: 20,
  VECTOR_ROW_COUNT: 20,
  MAX_GAME_MOVES: 500,
  NUM_GAMES_TO_PLAY: 10
}

const generic = {
  EMPTY_CELL_VALUE: 0,
  FILLED_CELL_VALUE: 1
}

module.exports = {
  ai,
  generic,
  tetris
}
