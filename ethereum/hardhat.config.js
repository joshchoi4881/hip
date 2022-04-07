require("dotenv").config();
require("@nomiclabs/hardhat-waffle");

module.exports = {
  solidity: "0.8.0",
  networks: {
    rinkeby: {
      url: process.env.ALCHEMY_STAGING_HTTP,
      accounts: [process.env.PRIVATE_KEY],
    },
    mainnet: {
      chainId: 1,
      url: process.env.ALCHEMY_PROD_HTTP,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
};
