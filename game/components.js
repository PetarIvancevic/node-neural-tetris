const _ = require('lodash')

const constants = require('../constants')
const {tetris} = constants

const baseBlock = function (isRotationPossibleFn, blockType) {
  this.isMovable = true
  this.type = tetris.blockTypes[blockType]

  this.advance = function (checkCollision, boardHeight = constants.ai.ROW_COUNT) {
    let occupiedPositionsSize = _.size(this.occupiedPositions)

    for (let i = 0; i < occupiedPositionsSize; i++) {
      let newYPosition = this.occupiedPositions[i].y + 1

      if (newYPosition === constants.ai.ROW_COUNT || checkCollision(this.occupiedPositions[i].x, newYPosition)) {
        this.isMovable = false
        break
      }
    }

    if (this.isMovable) {
      for (let i = 0; i < occupiedPositionsSize; i++) {
        this.occupiedPositions[i].y++
      }
    }
  }

  this.move = function (direction) {
    const newPositions = []
    const movement = (direction === 'left') ? -1 : 1

    for (let i = 0; i < _.size(this.occupiedPositions); i++) {
      const {x, y} = this.occupiedPositions[i]

      newPositions[i] = {x, y}

      if (direction === 'down') {
        newPositions[i].y += 1
      } else {
        newPositions[i].x += movement
      }
    }

    if (isRotationPossibleFn(newPositions)) {
      this.occupiedPositions = newPositions
    }
  }
}

// I-block
const IBlock = function (isRotationPossibleFn) {
  baseBlock.call(this, isRotationPossibleFn, 'IBlock')

  const possibleRotations = 4
  let currentRotation = _.random(1, possibleRotations)
  let tempRotation = currentRotation
  this.occupiedPositions = []

  this.populateRotationPositions = function () {
    let x, y

    if (this.occupiedPositions[0]) {
      x = this.occupiedPositions[0].x
      y = this.occupiedPositions[0].y
    } else {
      switch (currentRotation) {
        case 1:
        case 4:
          x = 3; y = 2
          break
        case 2:
        case 3:
          x = 4; y = 1
          break
      }
    }

    let newPositions = []

    switch (tempRotation) {
      case 1:
        x += 1
        y -= 1
        newPositions[0] = {x, y}
        newPositions[1] = {x: x - 2, y}
        newPositions[2] = {x: x - 1, y}
        newPositions[3] = {x: x + 1, y}
        break
      case 2:
        newPositions[0] = {x, y}
        newPositions[1] = {x, y: y - 1}
        newPositions[2] = {x, y: y + 1}
        newPositions[3] = {x, y: y + 2}
        break
      case 3:
        x -= 1
        y += 1
        newPositions[0] = {x, y}
        newPositions[1] = {x: x - 1, y}
        newPositions[2] = {x: x - 2, y}
        newPositions[3] = {x: x + 1, y}
        break
      case 4:
        newPositions[0] = {x, y}
        newPositions[1] = {x, y: y - 2}
        newPositions[2] = {x, y: y - 1}
        newPositions[3] = {x, y: y + 1}
        break
    }

    if (isRotationPossibleFn(newPositions)) {
      this.occupiedPositions = newPositions
      currentRotation = tempRotation
    }
  }

  this.changeRotation = function () {
    tempRotation = (tempRotation % 4) + 1
    this.populateRotationPositions()
  }

  this.populateRotationPositions()
}

// J-block
const JBlock = function (isRotationPossibleFn) {
  baseBlock.call(this, isRotationPossibleFn, 'JBlock')

  const possibleRotations = 4
  let currentRotation = _.random(1, possibleRotations)
  let tempRotation = currentRotation

  this.occupiedPositions = []

  this.populateRotationPositions = function () {
    const {x, y} = this.occupiedPositions[0] || {x: 4, y: 1}
    let newPositions = [{x, y}]

    switch (tempRotation) {
      case 1:
        newPositions[1] = {x: x - 1, y: y - 1}
        newPositions[2] = {x: x - 1, y}
        newPositions[3] = {x: x + 1, y}
        break
      case 2:
        newPositions[1] = {x: x + 1, y: y - 1}
        newPositions[2] = {x, y: y - 1}
        newPositions[3] = {x, y: y + 1}
        break
      case 3:
        newPositions[1] = {x: x - 1, y}
        newPositions[2] = {x: x + 1, y}
        newPositions[3] = {x: x + 1, y: y + 1}
        break
      case 4:
        newPositions[1] = {x: x - 1, y: y + 1}
        newPositions[2] = {x, y: y + 1}
        newPositions[3] = {x, y: y - 1}
        break
    }

    if (isRotationPossibleFn(newPositions)) {
      this.occupiedPositions = newPositions
      currentRotation = tempRotation
    }
  }

  this.changeRotation = function () {
    tempRotation = (tempRotation % 4) + 1
    this.populateRotationPositions()
  }

  this.populateRotationPositions()
}

// L-block
const LBlock = function (isRotationPossibleFn) {
  baseBlock.call(this, isRotationPossibleFn, 'LBlock')

  const possibleRotations = 4
  let currentRotation = _.random(1, possibleRotations)
  let tempRotation = currentRotation

  this.occupiedPositions = []

  this.populateRotationPositions = function () {
    const {x, y} = this.occupiedPositions[0] || {x: 4, y: 1}
    let newPositions = [{x, y}]

    switch (tempRotation) {
      case 1:
        newPositions[1] = {x: x - 1, y}
        newPositions[2] = {x: x + 1, y}
        newPositions[3] = {x: x + 1, y: y - 1}
        break
      case 2:
        newPositions[1] = {x, y: y - 1}
        newPositions[2] = {x, y: y + 1}
        newPositions[3] = {x: x + 1, y: y + 1}
        break
      case 3:
        newPositions[1] = {x: x - 1, y: y + 1}
        newPositions[2] = {x: x - 1, y}
        newPositions[3] = {x: x + 1, y}
        break
      case 4:
        newPositions[1] = {x: x - 1, y: y - 1}
        newPositions[2] = {x, y: y - 1}
        newPositions[3] = {x, y: y + 1}
        break
    }

    if (isRotationPossibleFn(newPositions)) {
      this.occupiedPositions = newPositions
      currentRotation = tempRotation
    }
  }

  this.changeRotation = function () {
    tempRotation = (tempRotation % 4) + 1
    this.populateRotationPositions()
  }

  this.populateRotationPositions()
}

// O-block
const OBlock = function (isRotationPossibleFn) {
  baseBlock.call(this, isRotationPossibleFn, 'OBlock')

  this.occupiedPositions = [{
    x: 2, y: 0
  }, {
    x: 3, y: 0
  }, {
    x: 2, y: 1
  }, {
    x: 3, y: 1
  }]

  this.changeRotation = function () {}
}

// S-block
const SBlock = function (isRotationPossibleFn) {
  baseBlock.call(this, isRotationPossibleFn, 'SBlock')

  const possibleRotations = 4
  let currentRotation = _.random(1, possibleRotations)
  let tempRotation = currentRotation

  this.occupiedPositions = []

  this.populateRotationPositions = function () {
    const {x, y} = this.occupiedPositions[0] || {x: 4, y: 1}
    let newPositions = [{x, y}]

    switch (tempRotation) {
      case 1:
        newPositions[1] = {x: x - 1, y}
        newPositions[2] = {x, y: y - 1}
        newPositions[3] = {x: x + 1, y: y - 1}
        break
      case 2:
        newPositions[1] = {x, y: y - 1}
        newPositions[2] = {x: x + 1, y}
        newPositions[3] = {x: x + 1, y: y + 1}
        break
      case 3:
        newPositions[1] = {x: x - 1, y: y + 1}
        newPositions[2] = {x, y: y + 1}
        newPositions[3] = {x: x + 1, y}
        break
      case 4:
        newPositions[1] = {x: x - 1, y: y - 1}
        newPositions[2] = {x: x - 1, y}
        newPositions[3] = {x, y: y + 1}
        break
    }

    if (isRotationPossibleFn(newPositions)) {
      this.occupiedPositions = newPositions
      currentRotation = tempRotation
    }
  }

  this.changeRotation = function () {
    tempRotation = (tempRotation % 4) + 1
    this.populateRotationPositions()
  }

  this.populateRotationPositions()
}

// T-block
const TBlock = function (isRotationPossibleFn) {
  baseBlock.call(this, isRotationPossibleFn, 'TBlock')

  const possibleRotations = 4
  let currentRotation = _.random(1, possibleRotations)
  let tempRotation = currentRotation
  this.occupiedPositions = []

  this.populateRotationPositions = function () {
    const {x, y} = this.occupiedPositions[0] || {x: 4, y: 1}
    let newPositions = [{x, y}]

    switch (tempRotation) {
      case 1:
        newPositions[1] = {x: x - 1, y}
        newPositions[2] = {x, y: y - 1}
        newPositions[3] = {x: x + 1, y}
        break
      case 2:
        newPositions[1] = {x, y: y - 1}
        newPositions[2] = {x: x + 1, y}
        newPositions[3] = {x, y: y + 1}
        break
      case 3:
        newPositions[1] = {x: x - 1, y}
        newPositions[2] = {x, y: y + 1}
        newPositions[3] = {x: x + 1, y}
        break
      case 4:
        newPositions[1] = {x, y: y - 1}
        newPositions[2] = {x: x - 1, y}
        newPositions[3] = {x, y: y + 1}
        break
    }

    if (isRotationPossibleFn(newPositions)) {
      this.occupiedPositions = newPositions
      currentRotation = tempRotation
    }
  }

  this.changeRotation = function () {
    tempRotation = (tempRotation % 4) + 1
    this.populateRotationPositions()
  }

  this.populateRotationPositions()
}

// Z-block
const ZBlock = function (isRotationPossibleFn) {
  baseBlock.call(this, isRotationPossibleFn, 'ZBlock')

  const possibleRotations = 4
  let currentRotation = _.random(1, possibleRotations)
  let tempRotation = currentRotation
  this.occupiedPositions = []

  this.populateRotationPositions = function () {
    const {x, y} = this.occupiedPositions[0] || {x: 4, y: 1}
    let newPositions = [{x, y}]

    switch (tempRotation) {
      case 1:
        newPositions[1] = {x: x - 1, y: y - 1}
        newPositions[2] = {x, y: y - 1}
        newPositions[3] = {x: x + 1, y}
        break
      case 2:
        newPositions[1] = {x: x + 1, y: y - 1}
        newPositions[2] = {x: x + 1, y}
        newPositions[3] = {x, y: y + 1}
        break
      case 3:
        newPositions[1] = {x: x - 1, y: y - 1}
        newPositions[2] = {x, y: y - 1}
        newPositions[3] = {x: x + 1, y}
        break
      case 4:
        newPositions[1] = {x, y: y - 1}
        newPositions[2] = {x: x - 1, y}
        newPositions[3] = {x: x - 1, y: y + 1}
        break
    }

    if (isRotationPossibleFn(newPositions)) {
      this.occupiedPositions = newPositions
      currentRotation = tempRotation
    }
  }

  this.changeRotation = function () {
    tempRotation = (tempRotation % 4) + 1
    this.populateRotationPositions()
  }

  this.populateRotationPositions()
}

module.exports = {
  IBlock,
  JBlock,
  LBlock,
  OBlock,
  SBlock,
  TBlock,
  ZBlock
}
