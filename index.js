const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

exports.getBalance = functions.https.onRequest((req, res) => {
  admin.database().ref('/balance').once('value').then(snapshot => {
    res.send(`${snapshot.val()}`)
  })
})

exports.withdrawTransaction = functions.https.onRequest((req, res) => {
  let withdrawAmount = req.query.amount
  let oldBalance = 0
  admin.database().ref('/balance').transaction(currentBalance => {
    if (currentBalance) {
      oldBalance = currentBalance
      return currentBalance - withdrawAmount
    }
    return currentBalance
  }, (error, committed, snapshot) => {
    if (error) {
      res.status(500).send('Transaction failed abnormally!', error)
    } else if (!committed) {
      res.status(500).send('Aborted the transaction.')
    } else {
      let newBalance = snapshot.val()
      console.log({
        oldBalance,
        withdrawAmount,
        newBalance
      })
      res.send('success')
    }
  })
})

exports.stock = functions.https.onRequest((req, res) => {
  let amount = parseInt(req.query.Amount)
  let id = req.query.ProductId
  let Actions = req.query.Actions
  let inStock = 0
  let output = 0
  admin.database().ref('/products/' + id + '/inStock').transaction(currentStock => {
    if (currentStock) {
      inStock = currentStock
      if(Actions === 'Deduct') {
        if(parseInt(currentStock) >= amount){
          output = inStock - amount
          return output
        }else {
          res.status(403).send('Not enough values for Deduct')
          return
        }
      }else if(Actions === 'Add') {
        output = inStock + amount
        return output
      }else if (Actions === 'Update') {
        output = amount
        return output
      }
    }
    return currentStock
  }, (error, committed, snapshot) => {
    if (error) {
      res.status(403).send('Transaction failed abnormally!', error)
    } else if (!committed) {
      res.status(403).send('Aborted the transaction.')
    } else {
      let newStock = snapshot.val()
      console.log({
        inStock,
        amount,
        Actions,
        newStock,
        id,
        output
      })
      res.send(`${snapshot.val()}`)
    }
  })
})
