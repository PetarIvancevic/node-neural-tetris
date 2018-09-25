const _ = require('lodash')

let finalArr = []
const arr = ['IBlock', 'SBlock', 'ZBlock', 'JBlock', 'LBlock', 'OBlock', 'TBlock']
const maxIterations = parseInt(500 / _.size(arr))

for (let i = 0; i < maxIterations; i++) {
  finalArr.push(_.shuffle(arr))
}

finalArr.push(_(arr).shuffle().take(3).value())

finalArr = _.flatten(finalArr)
// finalArr = _(finalArr).flatten().shuffle().value()

console.log(_.size(finalArr))
console.log(JSON.stringify(finalArr))
