const { getNamedAccounts, ethers } = require("hardhat");

async function main() {
    const { deployer } = await getNamedAccounts(); // from our local specs in the hardhat.config.js
    const fundMe = await ethers.getContract("FundMe", deployer);
    console.log("Withdrawing...");
    const txResponse = await fundMe.withdraw();
    await txResponse.wait(1);
    console.log("Withdrew successfully");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
