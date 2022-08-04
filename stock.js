#!/usr/bin/env node
const program = require('commander')
const winston = require('winston')
const axios = require("axios").default
const chalk = require('chalk')

const show = console.log;

const logConfiguration = {

    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
    ),
    transports: [
        //new winston.transports.Console(),

        new winston.transports.File({
            filename: 'logs/stock-operational.log', level: 'debug'}
        )
    ]
};

const logger = winston.createLogger(logConfiguration);
const { description, version } = require('./package.json')
const yahooapikey = 'xxx'

logger.info('Hello, Winston!');

program
 .description(description )
 .version(version, '-v, - version')
 .option('-t, --ticker <type>', 'which stock ticker to retrieve a quote', 'aapl')
 .parse(process.argv)

async function getHistoricalData(stockTicker) {
    logger.debug('Getting information for ' + stockTicker)
    let options = {
        method: 'GET',
        url: 'https://yfapi.net/v8/finance/spark/',
        params: {interval: '1d', range: '1y', symbols: stockTicker},
        headers: {
          'x-api-key': yahooapikey
        }
      };
    
    try { 
        let response = await axios.request(options)
        console.log(response.data)
        logger.info(response.data);
    } catch( error ) {
        logger.error(error);
    }
}

async function getStockSummary(stockTicker) {
    logger.debug('Getting information for ' + stockTicker)
    let options = {
        method: 'GET',
        url: 'https://yfapi.net/v11/finance/quoteSummary/' + stockTicker,
        params: {modules: 'defaultKeyStatistics,assetProfile'},
        headers: {
          'x-api-key': yahooapikey
        }
      };
    
    try { 
        let response = await axios.request(options)
    
        console.log(response.data.quoteSummary.result[0].defaultKeyStatistics);
    } catch( error ) {
        logger.error(error);
    }
}

async function getStockQuote(stockTicker) {
    logger.debug('Getting information for ' + stockTicker)
    let options = {
        method: 'GET',
        url: 'https://yfapi.net/v6/finance/quote/',
        params: {symbols: stockTicker},
        headers: {
          'x-api-key': yahooapikey
        }
      };
    
    try { 
        let response = await axios.request(options)
        logger.debug(response.data);
        show(chalk.blue('Stock ') + stockTicker.toUpperCase() + ':');
        show(chalk.blue('    Market price is: ') + chalk.red(response.data.quoteResponse.result[0].regularMarketPrice))
        show(chalk.blue('    Percent change is: ') + chalk.red(response.data.quoteResponse.result[0].regularMarketChangePercent))
        show(chalk.blue('    Market range today is: ') + chalk.red(response.data.quoteResponse.result[0].regularMarketDayRange))
    } catch( error ) {
        logger.error(error);
    }
}

async function execute() {
    try {
        /**
         *                                Last Close      1 Day        YTD
         * Dow Jones          - ^DJI
         * S&P 500            - ^GSPC
         * Nasdag             - ^IXIC
         * BitCoin USD        - BTC-USD
         * Ethereum USD       - ETH-USD
         * 10 Year Treasury   - ^TNX
         * OIL                - CL=F
         * GOLD               - GC=F
         * Farmland           - LAND
         */

        await getStockQuote(program.opts().ticker);
        //await getStockSummary(program.opts().ticker);
        await getHistoricalData(program.opts().ticker);
    }
    catch {
        logger.error('Could not retrieve ${stockTicker}')
    }

    logger.info('End of stock command');
}

execute()