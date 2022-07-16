const { developmentChains } = require("../helper-hardhat-config")
const {  network, ethers } = require("hardhat")
const DECIMALS="18"
const INITIAL_PRICE=ethers.utils.parseUnits("2000","ether")
module.exports = async ({ deployments, getNamedAccounts }) => {
    const BASE__FEE = ethers.utils.parseEther("0.25") // 0.25 is this the premium in LINK?->POINT_TWOFIVE_LINK
    const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas

    const { deployer } = await getNamedAccounts()
    const { deploy, log } = deployments
    const args = [BASE__FEE, GAS_PRICE_LINK]
    if (developmentChains.includes(network.name)) {
        log("Local network detected !!!! Deploying mocks")
        await deploy("VRFCoordinatorV2Mock", {
            from: deployer,
            log: true,
            args: args,
        })
        await deploy("MockV3Aggregator",{
            from:deployer,
            log:true,
            args:[DECIMALS,INITIAL_PRICE]
        })
        log("Mocks deployed!!!!!")
        log("----------------------------")
    }
}

module.exports.tags = ["all", "mocks"]
