const { network } = require("hardhat")
const {
  helperConfig,
  developmentChains,
  DECIMALS,
  INITIAL_ANSWER,
} = require("../helper_hardhat.config.js")

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deploy, log } = deployments
  const { deployer } = await getNamedAccounts()
  const chainId = network.config.chainId

  if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks...")
    const mockV3Aggregator = await deploy("MockV3Aggregator", {
      from: deployer,
      args: [DECIMALS, INITIAL_ANSWER], // calling to the constructor
      log: true,
    })
    log("Mocks deployed!")
    log("-----------------------------------")
  }
}

module.exports.tags = ["all", "mocks"]
