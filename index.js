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

// given a token symbol and amount, return offers from all dexes
// sorted descending by best price
module.exports = {
  main(symbol, amount, direction, decimals) 
  {
    if (direction !== 'BUY' && direction !== 'SELL') 
    {
      throw new Error(`must specify BUY or SELL. you specified "${direction}"`)
    }
    
    const dexes = [
      new AirSwap(),
      new Bancor(decimals),
      new BambooRelay(),
      new DDEX(),
      new Eth2Dai(),
      new Ethfinex(),
      new Forkdelta(),
      new IDEX(),
      new Kyber(),
      new RadarRelay(),
      new SaturnNetwork('eth'),
      new Uniswap(),
      new Switcheo(),
    ]

    
    var Tokens = ["DAI", "USDT"], Sell_Buy = ["SELL", "BUY"], Exch_Pairs = dexes

    const promises = dexes.map(dex =>   
      dex.computePrice(symbol, amount, dex.name === 'DDEX' ? DDEX_TAKER_FEE : 0),
    )


    

    return Promise.all(promises).then(results => {

      var Arr = []

      for(var i=0; i<results.length; i++)
      {
        for(var x=0; x<results.length; x++)
        {
            if(results[i].exchangeName !== results[x].exchangeName && (results[i].avgPrice - results[x].avgPrice)>0)
            {
                Arr.push({"exch1": `${results[x].exchangeName}`, 
                          "exch1 Price" : `${results[x].avgPrice}`,
                          "exch2": `${results[i].exchangeName}`,
                          "exch2 Price" : `${results[i].avgPrice}`,
                          "transction": `from ${results[x].exchangeName} to ${results[i].exchangeName} at ${results[i].avgPrice - results[x].avgPrice} difference ` } )
            }
            else if(results[i].exchangeName !== results[x].exchangeName && (results[i].avgPrice - results[x].avgPrice)<0)
              {
                Arr.push({
                         "exch1": `${results[x].exchangeName}`, 
                         "exch1 Price" : `${results[x].avgPrice}`,
                         "exch2": `${results[i].exchangeName}`,
                        "exch2 Price" : `${results[i].avgPrice}`,
                         "transction": `from ${results[i].exchangeName} to ${results[x].exchangeName} at ${results[i].avgPrice - results[x].avgPrice} difference ` } )
              }
              else
                {
                  Arr.push({"error" : "some shit went down! " })
                }
        }
      }

      return Arr

    })

    // .then(results =>  {
    //       const ExchangesAndPrices = results.map(result => {

    //         result = {"ExchName": result.exchangeName, "AvgPrice":result.avgPrice}

    //         return result
    //       });

    //       return ExchangesAndPrices 
    //     })
    
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
