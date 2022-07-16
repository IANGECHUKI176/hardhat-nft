const {network, ethers } = require("hardhat")
const { verify } = require("../utils/verify")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const fs = require("fs")
module.exports = async ({deployments, getNamedAccounts}) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
        ethUsdPriceFeedAddress = mockV3Aggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    const lowSvg = await fs.readFileSync(
        "./images/dynamicNft/frown.svg",
        "utf8"
    )
    const highSvg = await fs.readFileSync(
        "./images/dynamicNft/happy.svg",
        "utf8"
    )
    const args = [ethUsdPriceFeedAddress, lowSvg, highSvg]
    const dynamicSvgNft = await deploy("DynamicSvgNft", {
        from: deployer,
        log: true,
        args: args,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    if(!developmentChains.includes(network.name)){
        log("Verifying.........")
        await verify(dynamicSvgNft.address,args)
    }
    log("-----------------------------")
}

module.exports.tags=["all","dynamicsvg","main"]