const { deployments, ethers, getNamedAccounts, network } = require("hardhat");
const { assert, expect } = require("chai");
const { developmentChains } = require("../../helper-hardhat-config");

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", function () {
          let fundMe, deployer, MockV3Aggregator;
          const sendValue = ethers.utils.parseEther("1");
          beforeEach(async function () {
              // const accounts = await ethers.getSigners();
              // const deployer = accounts[0];
              deployer = (await getNamedAccounts()).deployer;
              await deployments.fixture(["all"]);
              fundMe = await ethers.getContract("FundMe", deployer);
              MockV3Aggregator = await ethers.getContract(
                  "MockV3Aggregator",
                  deployer
              );
          });

          describe("Constructor", function () {
              it("Sets the aggregator addresses correctly", async function () {
                  const response = await fundMe.getPriceFeed();
                  assert.equal(response, MockV3Aggregator.address);
              });
          });

          describe("donate", function () {
              it("Fails if you don't send enough ETH", async function () {
                  await expect(fundMe.donate()).to.be.revertedWithCustomError(
                      fundMe,
                      "FundMe__LessThanMinFundRequired"
                  );
              });
              it("Updates the amount fund donated by the sender", async function () {
                  await fundMe.donate({ value: sendValue });
                  const expectedValue = await fundMe.getAddressToAmountFunded(
                      deployer
                  );
                  assert.equal(expectedValue.toString(), sendValue.toString());
              });
              it("Adds funder to the s_funders array", async function () {
                  await fundMe.donate({ value: sendValue });
                  const funder = await fundMe.getFunders(0);
                  assert.equal(deployer, funder);
              });
          });
          describe("withdraw", function () {
              beforeEach(async function () {
                  await fundMe.donate({ value: sendValue });
              });

              it("Withdraws ETH with the owner", async function () {
                  // Arrange
                  const fundMeStartBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const deployerStartBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  // Act
                  const txResponse = await fundMe.withdraw();
                  const txReceipt = await txResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = txReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const fundMeEndBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );

                  const deployerEndBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  // Assert
                  assert.equal(fundMeEndBalance.toString(), 0);
                  assert.equal(
                      deployerEndBalance.add(gasCost).toString(),
                      deployerStartBalance.add(fundMeStartBalance).toString()
                  );
              });

              it("Allows us to withdraw from multiple funders", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners();
                  for (let i = 0; i < 5; i++) {
                      // just connect and fund the money, not deploy the new contract
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.donate({
                          value: sendValue,
                      });
                  }

                  const fundMeStartBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const deployerStartBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  // Act
                  const txResponse = await fundMe.withdraw();
                  const txReceipt = await txResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = txReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const fundMeEndBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );

                  const deployerEndBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  // Assert
                  assert.equal(fundMeEndBalance.toString(), 0);
                  assert.equal(
                      deployerEndBalance.add(gasCost).toString(),
                      deployerStartBalance.add(fundMeStartBalance).toString()
                  );

                  // Make sure that the s_funders are reset properly
                  await expect(fundMe.getFunders(0)).to.be.reverted;

                  // Make sure that the Mapping got all zero after the withdraw
                  for (let i = 0; i < 5; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });

              it("Only allows the owner to withdraw", async function () {
                  const accounts = await ethers.getSigners();
                  const hackerConnectedContract = await fundMe.connect(
                      accounts[1]
                  );
                  await expect(
                      hackerConnectedContract.withdraw()
                  ).to.be.revertedWithCustomError(fundMe, "FundMe__NotOwner");
              });
          });

          describe("cheaperWithdraw", async function () {
              it("Cheaper withdraws ETH with the owner", async function () {
                  // Arrange
                  const fundMeStartBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const deployerStartBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  // Act
                  const txResponse = await fundMe.cheaperWithdraw();
                  const txReceipt = await txResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = txReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const fundMeEndBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );

                  const deployerEndBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  // Assert
                  assert.equal(fundMeEndBalance.toString(), 0);
                  assert.equal(
                      deployerEndBalance.add(gasCost).toString(),
                      deployerStartBalance.add(fundMeStartBalance).toString()
                  );
              });

              it("Applies cheaperWithdraw testing...", async function () {
                  // Arrange
                  const accounts = await ethers.getSigners();
                  for (let i = 0; i < 5; i++) {
                      // just connect and fund the money, not deploy the new contract
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      );
                      await fundMeConnectedContract.donate({
                          value: sendValue,
                      });
                  }

                  const fundMeStartBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );
                  const deployerStartBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  // Act
                  const txResponse = await fundMe.cheaperWithdraw();
                  const txReceipt = await txResponse.wait(1);
                  const { gasUsed, effectiveGasPrice } = txReceipt;
                  const gasCost = gasUsed.mul(effectiveGasPrice);

                  const fundMeEndBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  );

                  const deployerEndBalance = await fundMe.provider.getBalance(
                      deployer
                  );

                  // Assert
                  assert.equal(fundMeEndBalance.toString(), 0);
                  assert.equal(
                      deployerEndBalance.add(gasCost).toString(),
                      deployerStartBalance.add(fundMeStartBalance).toString()
                  );

                  // Make sure that the s_funders are reset properly
                  await expect(fundMe.getFunders(0)).to.be.reverted;

                  // Make sure that the Mapping got all zero after the withdraw
                  for (let i = 0; i < 5; i++) {
                      assert.equal(
                          await fundMe.getAddressToAmountFunded(
                              accounts[i].address
                          ),
                          0
                      );
                  }
              });
          });
      });
