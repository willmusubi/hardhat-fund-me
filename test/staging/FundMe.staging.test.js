const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe;
          let deployer;
          const sendValue = ethers.utils.parseEther("0.01");

          beforeEach(async function () {
              deployer = (await getNamedAccounts()).deployer;
              fundMe = await ethers.getContract("FundMe", deployer);
          });
          it("Allows people to donate and withdraw", async function () {
              await fundMe.donate({ value: sendValue, gasLimit: 3e7 });
              await fundMe.withdraw();
              const endingBlance = await fundMe.provider.getBalance(
                  fundMe.address
              );
              assert.equal(endingBlance.toString(), 0);
          });
      });
