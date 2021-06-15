const rp = require('request-promise')
const { KYBER_URL } = require('../constants.js')

module.exports = class Kyber {
  constructor() {
    this.sellRateUrl = `${KYBER_URL}/sell_rate`
    this.buyRateUrl = `${KYBER_URL}/buy_rate`
    this.currenciesUrl = `${KYBER_URL}/currencies`
    this.name = 'Kyber'
  }

  // fetch all supported tokens traded on kyber
  async getCurrencies() {
    const config = {
      timeout: 3000,
      uri: this.currenciesUrl,
      method: 'GET',
      json: true,
    }
    const currenciesResponse = await rp(config)
    const { error, data } = currenciesResponse
    if (error !== false || !data) {
      throw new Error(`error fetching data from ${this.name}: ${error}`)
    } else {
      return data
    }
  }

  async getBuyRate(id, desiredAmount) {
    const config = {
      timeout: 3000,
      uri: `${this.buyRateUrl}?id=${id}&qty=${desiredAmount}`,
      method: 'GET',
      json: true,
    }
    const buyRateResponse = await rp(config)
    const { error, data } = buyRateResponse
    if (error !== false || !data) {
      throw new Error(`error fetching buy rate from ${this.name}: ${error}`)
    } else {
      return data
    }
  }

  async getSellRate(id, desiredAmount) {
    const config = {
      timeout: 3000,
      uri: `${this.sellRateUrl}?id=${id}&qty=${desiredAmount}`,
      method: 'GET',
      json: true,
    }
    const sellRateResponse = await rp(config)
    const { error, data } = sellRateResponse
    if (error !== false || !data) {
      throw new Error(`error fetching sell rate from ${this.name}: ${error}`)
    } else {
      return data
    }
  }

  // compute the average token price based on DEX liquidity and desired token amount
  async computePrice(symbol, desiredAmount) {
    let result = {}
    try {
      const currencies = await this.getCurrencies()
      const tokenObj = currencies.find(token => token.symbol === symbol)

      if (!tokenObj) {
        throw new Error(`${symbol} is not available on ${this.name}`)
      }

      let BuyRate = { src_qty, dst_qty },
          SellRate = { src_qty, dst_qty }

          //get AN ARRAY of object(s) containing
      const [sell_rate] = await this.getSellRate(tokenObj.id, desiredAmount)
      const [buy_rate] = await this.getBuyRate(tokenObj.id, desiredAmount)

        // SellRate = sell_rate 
        // BuyRate = buy_rate 

        const [sell_sourceQuantity] = sell_rate.src_qty
      const [sell_destinationQuantity] = sell_rate.dst_qty

      const [buy_sourceQuantity] = buy_rate.src_qty
      const [buy_destinationQuantity] = buy_rate.dst_qty

      // const { src_qty, dst_qty } = rate

      //get AN OBJECT KEY VALUE, which is AN ARRAY
    // const {sell_src_qty, sell_dst_qty} = sell_rate
      // const [SellRate_src_qty] = sell_rate.src_qty

      // const {buy_src_qty, buy_dst_qty} = buy_rate
      // const [BuyRate_dst_qty] = buy_rate.dst_qty

      // const [sell_sourceQuantity] = sell_src_qty
      // const [sell_destinationQuantity] = sell_dst_qty

      // const [buy_sourceQuantity] = buy_src_qty
      // const [buy_destinationQuantity] = buy_dst_qty
      // const [sourceQuantity] = src_qty
      // const [destinationQuantity] = dst_qty 

      const totalBuyPrice = buy_sourceQuantity,
      totalSellPrice = sell_destinationQuantity,
      avgBuyPrice = buy_sourceQuantity/ buy_destinationQuantity,
      avgSellPrice = sell_destinationQuantity / sell_sourceQuantity

      // const avgPrice = isSell ? destinationQuantity / sourceQuantity : sourceQuantity / destinationQuantity

      result = {
        exchangeName: this.name,
        totalBuyPrice,
        totalSellPrice,
        avgBuyPrice,
        avgSellPrice,
        // tokenAmount: isSell ? sourceQuantity : destinationQuantity,
        tokenSymbol: symbol,
        avgPrice,
        timestamp: Date.now(),
        error: null,
      }
    } catch (e) {
      result = {
        exchangeName: this.name,
        timestamp: Date.now(),
        error: e.message,
        tokenSymbol: symbol,
        tokenAmount: parseFloat(desiredAmount),
      }
    }
    return result 
  }
}