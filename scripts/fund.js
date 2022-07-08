const { ethers, run, network, getNamedAccounts } = require("hardhat")
require("dotenv/config")

async function main() {
    const { deployer } = getNamedAccounts()
    const fundMeFactory = await ethers.getContractFactory("FundMe", deployer)
    console.log("\nTesting contract interaction...")
    const transactionResponse = await fundMe.fund({
        value: ethers.utils.parseEther("0.1"),
    })
    await transactionResponse.wait(1)
    console.log("Funded!!!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
    })
