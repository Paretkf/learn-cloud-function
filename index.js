const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp(functions.config().firebase)

exports.getBalance = functions.https.onRequest((req, res) => {
  admin.database().ref('/balance').once('value').then(snapshot => {
    res.send(`${snapshot.val()}`)
  })
})

exports.withdraw = functions.https.onRequest((req, res) => {
  let withdrawAmount = req.query.amount
  admin.database().ref('/balance').once('value').then(snapshot => {
    let oldBalance = snapshot.val()
    let newBalance = oldBalance - withdrawAmount
    admin.database().ref('/balance').set(newBalance).then(() => {
      console.log({
        oldBalance,
        withdrawAmount,
        newBalance
      })
      res.send('success')
    })
  })
})
