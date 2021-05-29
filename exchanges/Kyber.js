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

      const sell_rate =  [rate] =  this.getSellRate(tokenObj.id, desiredAmount) 
      const buy_rate = [rate] =  this.getBuyRate(tokenObj.id, desiredAmount)

      const Sell_Price = { src_qty, dst_qty } = sell_rate.rate // eslint-disable-line camelcase
      const Buy_Price = { src_qty, dst_qty } = buy_rate.rate

      const sellSource = [sourceQuantity] = Sell_Price.src_qty // eslint-disable-line camelcase
      const buySource = [sourceQuantity] = Buy_Price.src_qty

      const sellDestination = [destinationQuantity] = Sell_Price.dst_qty // eslint-disable-line camelcase
      const buyDestination = [destinationQuantity] = Buy_Price.dst_qty

      // const avgPrice = isSell ? destinationQuantity / sourceQuantity : sourceQuantity / destinationQuantity
      const avgSellPrice = sellDestination.destinationQuantity / sellSource
      const avgBuyPrice = buySource.destinationQuantity / buyDestination

      result = {
        exchangeName: this.name,
        totalBuyPrice:  buySource,
        totalSellPrice: sellDestination,
        avgBuyPrice,
        avgSellPrice,
        tokenAmount_Sell: sellSource,
        tokenAmount_Buy : buyDestination,
        tokenSymbol: symbol,
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
