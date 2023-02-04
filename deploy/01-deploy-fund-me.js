// Normally we deploy contracts by three steps:
// 1. import
// 2. main function
// 3. calling of main function

// const { deployments, getNamedAccounts } = require("hardhat");

// // Basic Format
// function deployFunc(hre) {
//     console.log("Test");
//     hre.getNamedAccounts();
//     hre.deployments;
// }

// module.exports.default = deployFunc;
// // we specified here for % yarn hardhat deploy call

// // Async Format
// module.exports = async hre => {
//     const { getNamedAccounts, deployments } = hre; // put exact variables from hre
// };

const {
    networkConfig,
    developmentChains,
} = require("../helper-hardhat-config");
const { network } = require("hardhat");
const { verify } = require("../utils/verify");
require("dotenv").config();

// Async Good Format with JavaScript Syntactic Sugar
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts(); // grab an account from the accounts we specified in the hardhat.config.js file.
    const chainId = network.config.chainId;

    let ethUsdPriceFeedAddress;
    if (developmentChains.includes(network.name)) {
        const ethUsdPriceAggregator = await deployments.get("MockV3Aggregator");
        ethUsdPriceFeedAddress = ethUsdPriceAggregator.address;
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"];
    }
    log("----------------------------------------------------");
    log("Deploying FundMe and waiting for confirmations...");
    // instead of using a contract factory to deploy, hardhat can handle deploy by just using deply
    const args = [ethUsdPriceFeedAddress];
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args,
        log: true,
        // we need to wait if on a live network so we can verify properly
        waitConfirmations: network.config.blockConfirmations || 1,
    });
    log(`FundMe deployed at ${fundMe.address}`);
    log("-----------------------------------------------------");

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        await verify(fundMe.address, args);
    }
};
module.exports.tags = ["all", "fundme"];
