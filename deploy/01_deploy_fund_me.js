const { network } = require("hardhat")
const {
    helperConfig,
    developmentChains,
    networkConfig,
} = require("../helper_hardhat.config.js")
const { verify } = require("../utils/verify.js")

/*
function deployFunc() {
  console.log("HI!")
}

module.exports.default = deployFunc
*/
/* 
module.exports.default = async hre => {
  const { getNamedAccounts, deployments } = hre
}
*/

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    let ethUsdPriceFeedAddress

    // if the network is in develpmentChain array from helper_hardhat.config.js load the address of mocks
    if (developmentChains.includes(network.name)) {
        log("Development network detected! Loading MockV3Aggregator mock")
        const ethUsdPriceFeed = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdPriceFeed.address
    } else {
        log(
            `${network.name} detected! Loading corresponding aggregator address`
        )
        // if is not a devChain load the corresponding address
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    if (
        !developmentChains.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        log("verifying the smart contract...")
        await verify(fundMe.address, args)
        log("contract verifyed")
    }

    log("-----------------------------------")
}

module.exports.tags = ["all"]
