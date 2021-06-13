require('dotenv').config()
const AirSwap = require('./exchanges/AirSwap.js')
const BambooRelay = require('./exchanges/BambooRelay.js')
const Bancor = require('./exchanges/Bancor.js')
const DDEX = require('./exchanges/DDEX.js')
const Eth2Dai = require('./exchanges/Eth2Dai.js')
const Ethfinex = require('./exchanges/Ethfinex.js')
const Forkdelta = require('./exchanges/Forkdelta.js')
const IDEX = require('./exchanges/IDEX.js')
const Kyber = require('./exchanges/Kyber.js')
const RadarRelay = require('./exchanges/RadarRelay.js')
const SaturnNetwork = require('./exchanges/Saturn.js')
const Uniswap = require('./exchanges/Uniswap.js')
const Switcheo = require('./exchanges/Switcheo.js')
const { sortBids, sortAsks } = require('./helpers')
const { DDEX_TAKER_FEE } = require('./constants')
const HDWalletProvider = require('@truffle/hdwallet-provider')
const Web3 = require('web3')
const mnemonicPhrase = "sphere chef oven allow rifle close ribbon mask economy they shadow hour"
let provider = new HDWalletProvider({
  mnemonic: {
    phrase: mnemonicPhrase
  },
  providerOrUrl: process.env.RPC_URL
});

// given a token symbol and amount, return offers from all dexes
// sorted descending by best price
module.exports = {
  main(symbol, amount, direction, decimals) 
  {
    if (direction !== 'BUY' && direction !== 'SELL') 
    {
      throw new Error(`must specify BUY or SELL. you specified "${direction}"`)
    }
    
    // var web3 = new Web3(new HDWalletProvider(process.env.PRIVATE_KEY, process.env.RPC_URL))
    var web3 = new Web3(provider)
    // var web3 = new Web3('https://mainnet.infura.io/v3/f65faddcb26a434fbe94814951196f0e')
    
    const dexes = [
      new AirSwap(),
      new Bancor(decimals), // new BambooRelay(), // new DDEX(),
      new Eth2Dai(), // new Ethfinex(), // new Forkdelta(), // new IDEX(), // new Kyber(), // new RadarRelay(), // new SaturnNetwork('eth'),
      new Uniswap(), // new Switcheo(),
    ]


    const promises = dexes.map(dex =>   
      dex.computePrice(symbol, amount, dex.name === 'DDEX' ? DDEX_TAKER_FEE : 0),
    )


    return web3.eth.getGasPrice().then(gasPrice => {

             return web3.utils.fromWei(gasPrice, 'ether')

    }).then(GasInEth => {

      theGasProm = Promise.all(promises).then(results => {

        // var theGas = web3.eth.getGasPrice().then()
        var ArrayOfExchDiffs = []
        
  // while RunApp = true; run below operation
        for(var i=0; i<results.length; i++)
        {
          for(var x=0; x<results.length; x++)
          {
              if(results[i].exchangeName !== results[x].exchangeName)
              {
                  const exch1BuyPrice = results[x].avgBuyPrice,
                        exch1SellPrice = results[x].avgSellPrice,
                        exch2BuyPrice = results[i].avgBuyPrice,
                        exch2SellPrice = results[i].avgSellPrice
  
                  //Spread = exch1SellPrice - exch2BuyPrice [Buy @ exch2 and Sell @ exch1]
                  const Spread = exch1SellPrice - exch2BuyPrice
                      var tx_message 
  
                      //replace if(Spread>0) with While(Spread>0){execute Flash-Arb}
                        if(Spread > 0)
                        {
                          tx_message  =`buy from ${results[i].exchangeName} and sell to ${results[x].exchangeName} @ Spread = ${Spread}`
                        }
                        else
                            {
                              tx_message = `Spread = ${Spread} - Trade UNSUCCESSFUL!!!`
                            }
  
                   ArrayOfExchDiffs.push({"tx direction": ` from ${results[x].exchangeName} to ${results[i].exchangeName}`, 
                             "exch1BuyPrice": `${results[x].exchangeName} buy Price = ${exch1BuyPrice}`,
                             "exch1SellPrice" : `${results[x].exchangeName} Sell Price = ${exch1SellPrice}`,
                             "exch2BuyPrice" : `${results[i].exchangeName} Buy Price = ${exch2BuyPrice}`,
                             "exch2SellPrice" : `${results[i].exchangeName} Sell Price = ${exch2SellPrice}`,
                             tx_message,
                             GasInEth
                            //  'Gas Price': `${Gaza} is gas price gwei`
                             } )
              }
              
          }
        }
  
        return ArrayOfExchDiffs
  
      })

      return theGasProm
    })
    
    provider.engine.stop();
  },
  AirSwap,
  BambooRelay,
  Bancor,
  DDEX,
  Eth2Dai,
  Ethfinex,
  Forkdelta,
  IDEX,
  Kyber,
  RadarRelay,
  SaturnNetwork,
  Uniswap,
  Switcheo,
}
