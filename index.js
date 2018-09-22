var ethUtil = require('ethereumjs-util')
var sigUtil = require('eth-sig-util')
var Eth = require('ethjs')
window.Eth = Eth

var fs = require('fs')
var terms = fs.readFileSync(__dirname + '/terms.txt').toString()

function addLog(log) {
  document.getElementById('message').innerHTML += '<p>' + log + '</p>';
}

ethSignButton.addEventListener('click', function(event) {
  event.preventDefault()
  // var msg = '0x879a053d4800c6354e76c7985a865d2922c82fb5b3f4577b2fe08b998954f2e0'
  var msg = '0x99ab1f3b1111a7eb8fbb9797e5b05c2daa11ec771414ae3f9164ccf189c1cb33'

  // prepend '\x19Ethereum Signed Message:\n'
  var msgWithPrefix = '0x26cbdfebb0816db29333b93f298997437c28bb4097679650956f983b6eb41195'

  var from = web3.eth.accounts[0]
  var sign = function(msg, msgWithPrefix, fail) {
    web3.eth.sign(from, msgWithPrefix, function (err, result) {
      if (err) return addLog(err)
      addLog('SIGNED:' + result)

      addLog('recovering...')
      const msgParams = { data: msg }
      msgParams.sig = result;
      console.dir({ msgParams })
      const recovered = sigUtil.recoverPersonalSignature(msgParams)
      console.dir({ recovered })

      if (recovered === from ) {
        addLog('SigUtil Successfully verified signer as ' + from)
      } else if (fail) {
        addLog('SigUtil Failed without prefix, try with prefix again');
        fail();
      } else {
        addLog(recovered);
        console.dir(recovered)
        addLog('SigUtil Failed to verify signer when comparing ' + recovered + ' to ' + from)
        addLog('Failed, comparing ' + recovered + ' to ' + from)
      }
    })
  }

  sign(msg, msg, function () {
    setTimeout(function () {
      sign(msg, msgWithPrefix);
    }, 500);
  });
})

personalSignButton.addEventListener('click', function(event) {
  event.preventDefault()
  var text = terms
  // var msg = ethUtil.bufferToHex(new Buffer(text, 'utf8'))
  var msg = '0x99ab1f3b1111a7eb8fbb9797e5b05c2daa11ec771414ae3f9164ccf189c1cb33';
  // var msg = '0x1' // hexEncode(text)
  addLog(msg)
  var from = web3.eth.accounts[0]

  /*  web3.personal.sign not yet implemented!!!
   *  We're going to have to assemble the tx manually!
   *  This is what it would probably look like, though:
    web3.personal.sign(msg, from) function (err, result) {
      if (err) return addLog(err)
      addLog('PERSONAL SIGNED:' + result)
    })
  */

   addLog('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [msg, from]
  var method = 'personal_sign'

  web3.personal.sign(msg, from, null, (err, result) => {
    if (err) return addLog(err)
    addLog('PERSONAL SIGNED:' + result)

    addLog('recovering...')
    const msgParams = { data: msg }
    msgParams.sig = result;
    console.dir({ msgParams })
    const recovered = sigUtil.recoverPersonalSignature(msgParams)
    console.dir({ recovered })

    if (recovered === from ) {
      addLog('SigUtil Successfully verified signer as ' + from)
    } else {
      addLog(recovered);
      console.dir(recovered)
      addLog('SigUtil Failed to verify signer when comparing ' + recovered + ' to ' + from)
      addLog('Failed, comparing ' + recovered + ' to ' + from)
    }
  })

  // web3.currentProvider.sendAsync({
  //   method,
  //   params,
  //   from,
  // }, function (err, result) {
  //   addLog(err)
  //   addLog(result)
  //   if (err) return addLog(err)
  //   if (result.error) return addLog(result.error)
  //   addLog('PERSONAL SIGNED:' + JSON.stringify(result.result))

  //   addLog('recovering...')
  //   const msgParams = { data: msg }
  //   msgParams.sig = result.result
  //   console.dir({ msgParams })
  //   const recovered = sigUtil.recoverPersonalSignature(msgParams)
  //   console.dir({ recovered })

  //   if (recovered === from ) {
  //     addLog('SigUtil Successfully verified signer as ' + from)
  //   } else {
  //     console.dir(recovered)
  //     addLog('SigUtil Failed to verify signer when comparing ' + recovered.result + ' to ' + from)
  //     addLog('Failed, comparing %s to %s', recovered, from)
  //   }


  //   /*
  //   method = 'personal_ecRecover'
  //   var params = [msg, result.result]
  //   web3.currentProvider.sendAsync({
  //     method,
  //     params,
  //     from,
  //   }, function (err, recovered) {
  //     console.dir({ err, recovered })
  //     if (err) return addLog(err)
  //     if (result.error) return addLog(result.error)

  //     if (result.result === from ) {
  //       addLog('Successfully verified signer as ' + from)
  //     } else {
  //       addLog('Failed to verify signer when comparing ' + result.result + ' to ' + from)
  //     }

  //   })
  //   */
  // })

})


personalRecoverTest.addEventListener('click', function(event) {
  event.preventDefault()
  var text = 'hello!'
  var msg = ethUtil.bufferToHex(new Buffer(text, 'utf8'))
  // var msg = '0x1' // hexEncode(text)
  addLog(msg)
  var from = web3.eth.accounts[0]

  /*  web3.personal.sign not yet implemented!!!
   *  We're going to have to assemble the tx manually!
   *  This is what it would probably look like, though:
    web3.personal.sign(msg, from) function (err, result) {
      if (err) return addLog(err)
      addLog('PERSONAL SIGNED:' + result)
    })
  */

   addLog('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [msg, from]
  var method = 'personal_sign'

  web3.currentProvider.sendAsync({
    method,
    params,
    from,
  }, function (err, result) {
    if (err) return addLog(err)
    if (result.error) return addLog(result.error)
    addLog('PERSONAL SIGNED:' + JSON.stringify(result.result))

    addLog('recovering...')
    const msgParams = { data: msg }
    msgParams.sig = result.result

    method = 'personal_ecRecover'
    var params = [msg, result.result]
    web3.currentProvider.sendAsync({
      method,
      params,
      from,
    }, function (err, result) {
      var recovered = result.result
      addLog('ec recover called back:')
      console.dir({ err, recovered })
      if (err) return addLog(err)
      if (result.error) return addLog(result.error)


      if (recovered === from ) {
        addLog('Successfully ecRecovered signer as ' + from)
      } else {
        addLog('Failed to verify signer when comparing ' + result + ' to ' + from)
      }

    })
  })

})

ethjsPersonalSignButton.addEventListener('click', function(event) {
  event.preventDefault()
  var text = terms
  var msg = ethUtil.bufferToHex(new Buffer(text, 'utf8'))
  var from = web3.eth.accounts[0]

  addLog('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [from, msg]

  // Now with Eth.js
  var eth = new Eth(web3.currentProvider)

  eth.personal_sign(msg, from)
  .then((signed) => {
    addLog('Signed!  Result is: ', signed)
    addLog('Recovering...')

    return eth.personal_ecRecover(msg, signed)
  })
  .then((recovered) => {

    if (recovered === from) {
      addLog('Ethjs recovered the message signer!')
    } else {
      addLog('Ethjs failed to recover the message signer!')
      console.dir({ recovered })
    }
  })
})


signTypedDataButton.addEventListener('click', function(event) {
  event.preventDefault()

  const msgParams = [
    {
      type: 'string',
      name: 'Message',
      value: 'Hi, Alice!'
    },
    {
      type: 'uint32',
      name: 'A number',
      value: '1337'
    }
  ]

  var from = web3.eth.accounts[0]

  /*  web3.eth.signTypedData not yet implemented!!!
   *  We're going to have to assemble the tx manually!
   *  This is what it would probably look like, though:
    web3.eth.signTypedData(msg, from) function (err, result) {
      if (err) return addLog(err)
      addLog('PERSONAL SIGNED:' + result)
    })
  */

   addLog('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [msgParams, from]
  console.dir(params)
  var method = 'eth_signTypedData'

  web3.currentProvider.sendAsync({
    method,
    params,
    from,
  }, function (err, result) {
    if (err) return console.dir(err)
    if (result.error) {
      alert(result.error.message)
    }
    if (result.error) return addLog(result)
    addLog('PERSONAL SIGNED:' + JSON.stringify(result.result))

    const recovered = sigUtil.recoverTypedSignature({ data: msgParams, sig: result.result })

    if (recovered === from ) {
      alert('Successfully ecRecovered signer as ' + from)
    } else {
      alert('Failed to verify signer when comparing ' + result + ' to ' + from)
    }

  })

})

ethjsSignTypedDataButton.addEventListener('click', function(event) {
  event.preventDefault()

  const msgParams = [
    {
      type: 'string',
      name: 'Message',
      value: 'Hi, Alice!'
    },
    {
      type: 'uint32',
      name: 'A number',
      value: '1337'
    }
  ]

  var from = web3.eth.accounts[0]

  addLog('CLICKED, SENDING PERSONAL SIGN REQ')
  var params = [msgParams, from]

  var eth = new Eth(web3.currentProvider)

  eth.signTypedData(msgParams, from)
  .then((signed) => {
    addLog('Signed!  Result is: ', signed)
    addLog('Recovering...')

    const recovered = sigUtil.recoverTypedSignature({ data: msgParams, sig: signed })

    if (recovered === from ) {
      alert('Successfully ecRecovered signer as ' + from)
    } else {
      alert('Failed to verify signer when comparing ' + signed + ' to ' + from)
    }

  })
})
