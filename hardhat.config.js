require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("hardhat-deploy");
require("@nomiclabs/hardhat-etherscan");
// require("./tasks/accounts");
// require("./tasks/balance");
// require("./tasks/block-number");
require("hardhat-gas-reporter");
require("solidity-coverage");

const GOERLI_RPC_URL = process.env.GOERLI_RPC_URL || "";
const PRIVATE_KEY = process.env.PRIVATE_KEY || "";
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || "";
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */

module.exports = {
    solidity: {
        compilers: [
            { version: "0.8.17" },
            { version: "0.8.8" },
            { version: "0.6.0" },
        ], // multiple versions for compatibility
    },
    defaultNetwork: "hardhat",
    networks: {
        goerli: {
            url: GOERLI_RPC_URL,
            accounts: [PRIVATE_KEY],
            chainId: 5,
            blcokConfirmations: 6, // for etherscan to scan it onchain
        },
        localhost: {
            url: "http://127.0.0.1:8545/",
            // hardhat handled it, run "% yarn hardhat node" to check it out
            chainId: 31337,
        },
    },
    solidity: "0.8.7",
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
    gasReporter: {
        enabled: true,
        outputFile: "gas-report.txt",
        noColors: true,
        currency: "USD",
        coinmarketcap: COINMARKETCAP_API_KEY,
        // token: "MATIC",
    },
    namedAccounts: {
        deployer: {
            default: 0,
            4: 1, // This means Network4(Rinkeby)'s indexed 1 account is the depolyer
        },
        willmusubi: {
            default: 1,
        },
    },
};