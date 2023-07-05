require("@nomiclabs/hardhat-waffle");

const privateKeys = process.env.PRIVATE_KEYS || '';
const infuraApiKey = process.env.INFURA_API_KEY || '';

module.exports = {
  networks: {
    hardhat: {}, // Default network for testing and development with Hardhat
    goerli: {
      url: `https://goerli.infura.io/v3/${infuraApiKey}`,
      accounts: privateKeys.split(','),
    },
    main: {
      url: `https://main.infura.io/v3/${infuraApiKey}`,
      accounts: privateKeys.split(','),
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${infuraApiKey}`,
      accounts: privateKeys.split(','),
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${infuraApiKey}`,
      accounts: privateKeys.split(','),
    },
  },
  solidity: {
    version: '0.8.0',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
};
