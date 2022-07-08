const { expect, assert } = require("chai")
const { ethers, deployments, getNamedAccounts, network } = require("hardhat")
const { solidity } = require("ethereum-waffle")
const { developmentChains } = require("../../helper_hardhat.config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", async () => {
          let fundMe
          let deployer
          let mockV3Aggregator
          const sendValue = ethers.utils.parseEther("1") // parse 1 eth to 1e18 wei
          beforeEach(async () => {
              // get an specific account of the current network from hardhat.config.js
              // const accounts = await ethers.getSigners()
              // const accountZero = accounts[0]

              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"]) // execute all deployments
              fundMe = await ethers.getContract("FundMe", deployer) // get the last deploy instance of FundMe
              mockV3Aggregator = await ethers.getContract(
                  // get the last deploy instance of MockV3Aggregator
                  "MockV3Aggregator",
                  deployer
              )
          })
          describe("constructor", async () => {
              it("sets the aggregator addresses correctly", async () => {
                  const response = await fundMe.priceFeed()
                  assert.equal(response, mockV3Aggregator.address)
              })
          })
          describe("fund", async () => {
              it("Fails if you don't send enough ETH", async () => {
                  await expect(fundMe.fund()).to.be.revertedWith(
                      "You need to spend more ETH!"
                  )
              })
              beforeEach("Testing valid fund", async () => {
                  await fundMe.fund({ value: sendValue })
              })
              it("Update the amount funded data structure", async () => {
                  const response = await fundMe.addressToAmountFunded(deployer)

                  assert.equal(response.toString(), sendValue.toString())
              })
              it("Adds the founder to the founders array", async () => {
                  const response = await fundMe.funders(0)

                  assert.equal(response.toString(), deployer)
              })
          })
          describe("getVersion", async () => {
              it("fundMe getVersion match with aggregator version")
              //const response = await fundMe.getVersion()
              //const mockVersion = await mockV3Aggregator.version()

              //assert.equal(response.toString(), mockVersion.toString())
          })
          describe("withdraw", async () => {
              beforeEach(async () => {
                  await fundMe.fund({ value: sendValue })
              })
              it("withdraw ETH from a single founder", async () => {
                  // Arrange
                  //  to get the balance we need a contract object: could use FundMe or MockV3Aggregator instances
                  const startingFundMeBalance =
                      await mockV3Aggregator.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Act
                  const trasactionResponse = await fundMe.withdraw()
                  const trasactionReceipt = await trasactionResponse.wait(1)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  //  need to calculate the gas cost
                  //  to get the variables that i need from trasactionReceipt:
                  //  - check documetation
                  //  - use typescript
                  //  - debug the variable content
                  const { gasUsed, effectiveGasPrice } = trasactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  // Assert

                  assert.equal(endingFundMeBalance, 0)
                  assert.equal(
                      startingDeployerBalance
                          .add(startingFundMeBalance)
                          .toString(),
                      endingDeployerBalance.add(gasCost).toString()
                  )
              })
              it("withdraw ETH from a single founder using cheaperWithdraww")
              it("withdraw ETH from a multiple founders", async () => {
                  // Arrange
                  const accounts = await ethers.getSigners()
                  for (let i = 1; i < 6; i++) {
                      // this is how we can interact with fundMe with differents accounts
                      const fundMeConnectedContract = await fundMe.connect(
                          accounts[i]
                      )
                      await fundMeConnectedContract.fund({ value: sendValue })
                  }
                  const startingFundMeBalance =
                      await mockV3Aggregator.provider.getBalance(fundMe.address)
                  const startingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)
                  // Act
                  const trasactionResponse = await fundMe.withdraw()
                  //wait(1) error?
                  const trasactionReceipt = await trasactionResponse.wait(1)

                  const endingFundMeBalance = await fundMe.provider.getBalance(
                      fundMe.address
                  )
                  const endingDeployerBalance =
                      await fundMe.provider.getBalance(deployer)

                  const { gasUsed, effectiveGasPrice } = trasactionReceipt
                  const gasCost = gasUsed.mul(effectiveGasPrice)
                  // Assert            await expect(fundMe.funders(0)).to.be.reverted
                  await expect(fundMe.funders(0)).to.be.reverted
                  for (let i = 1; i < 6; i++) {
                      const funderBalance = await fundMe.addressToAmountFunded(
                          accounts[i].address
                      )

                      assert.equal(funderBalance, 0)
                  }
              })
              it("Only owner can withdraw", async () => {
                  const accounts = await ethers.getSigners()
                  const fundMeConnected = fundMe.connect(accounts[1])

                  expect(fundMeConnected.withdraw()).to.be.revertedWith(
                      "FundMe__NotOwner"
                  )
              })
          })
      })
