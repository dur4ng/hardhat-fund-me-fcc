const { ethers, run, network, getNamedAccounts } = require("hardhat")
require("dotenv/config")

async function main() {
    const { deployer } = getNamedAccounts()
    const fundMeFactory = await ethers.getContractFactory("FundMe", deployer)
    console.log("\nTesting contract interaction...")
    const transactionResponse = await fundMe.withdraw()
    await transactionResponse.wait(1)
    console.log("Withdraw!!!")
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.log(error)
    })
