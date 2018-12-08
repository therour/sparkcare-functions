const functions = require('firebase-functions');
const admin = require('firebase-admin');

const THRESHOLD = 0.8;
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
exports.helloWorld = functions.https.onRequest((req, res) => {
  res.send("Hello from Firebase!");
});

exports.solve = functions.https.onRequest((req, res) => {
  const app = admin.initializeApp(functions.config().firebase);
  const deleteApp = () => app.delete().catch(() => null);
  const db = admin.database();
  const gejala = req.body.gejala;

  db.ref('kasus').on('value',  (snapKasus) => {
    var dbKasus = snapKasus.val();

    db.ref('gejala').on('value', (snapGejala) => {
      var dbGejala = snapGejala.val();
      
      computedKasus = Object.keys(dbKasus).map((i) => {
        var kasus = dbKasus[i];
        kasus.total = kasus.gejala.reduce((rTotal,gTotal) => dbGejala[gTotal].bobot + rTotal, 0);
        kasus.mirip = kasus.gejala
                          .filter(gMirip => gejala.includes(gMirip))
                          .reduce((rMirip2,gMirip2) => dbGejala[gMirip2].bobot + rMirip2, 0);
        kasus.result = kasus.mirip / kasus.total;
        return kasus;
      })

      // kasusTermirip = Object.keys(computedKasus).reduce((a, b) => { return computedKasus[a].result > computedKasus[b].result ? a : b; })
      kasusTermirip = computedKasus.reduce((a,b) => a.result > b.result ? a : b);
      console.log(computedKasus);
      return deleteApp().then(() => res.send(kasusTermirip));
    })

  }, (errorObject) => {

    return deleteApp().then(() => res.send(errorObject.code));
  });
});