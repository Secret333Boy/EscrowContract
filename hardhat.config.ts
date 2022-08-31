import * as dotenv from 'dotenv';

import 'solidity-coverage';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomiclabs/hardhat-etherscan';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';
import 'hardhat-gas-reporter';
import 'hardhat-tracer';
import { HardhatNetworkUserConfig } from 'hardhat/types';
import './tasks';

dotenv.config();

console.log(process.env.PRIVATE_KEY);
/*
 * Get Private key from envVars and adapt it to Hardhat account formant
 * @return {[string]} Formatted PRIVATE_KEY to Hardhat account
 */
const getPrivateKey = () =>
    process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [];

/*
 * Get Private key from envVars and adapt it to Hardhat account formant
 * @param {string} url Url of eth network
 * @param {bool} saveDeployments Save deployments
 * @return {[string]} Formatted PRIVATE_KEY to Hardhat account
 */
const createNetworkConfig = (url = '', saveDeployments = false) => {
    return {
        url,
        accounts: getPrivateKey(),
        saveDeployments,
    } as HardhatNetworkUserConfig;
};

interface HardhatUserConfigWithGasReporter extends HardhatUserConfig {
    gasReporter: {
        enabled: boolean,
        gasPrice: number,
        coinmarketcap: string,
        currency: string,
    },
}
const config: HardhatUserConfigWithGasReporter = {
  defaultNetwork: 'hardhat',
  solidity: {
    version: '0.8.4',
    settings: {
      optimizer: {
        enabled: process.env.REPORT_GAS !== undefined || process.env.NODE_ENV === 'production',
        runs: 200
      }
    }
  },
  networks: {
    // Could be used for testing openzappelin and chainlink contracts.
    hardhat: process.env.MAIN_NET_FORK_URL
      ? {
          forking: {
            url: process.env.MAIN_NET_FORK_URL
          }
        }
      : {},
    localhost: {},
    ropsten: createNetworkConfig(process.env.ROPSTEN_URL),
    mainnet: createNetworkConfig(process.env.MAIN_NET_URL, true),
    kovan: createNetworkConfig(process.env.KOVAN_URL, true),
    matic: {
      url: 'https://rpc-mumbai.maticvigil.com',
      accounts: ['ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80']
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.PROJECT_ID}`,
      accounts: [process.env.PRIVATE_KEY ?? '']
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    gasPrice: Number(process.env.GAS_PRICE) || 21,
    coinmarketcap: process.env.COIN_MARKET_API_KEY || '',
    currency: 'USD'
  }
  // etherscan: {
  //     apiKey: process.env.ETHERSCAN_API_KEY,
  // },
};

export default config;
