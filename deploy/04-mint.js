const {network, ethers } = require("hardhat")
const { verify } = require("../utils/verify")
const { developmentChains, networkConfig } = require("../helper-hardhat-config")
const fs = require("fs")
module.exports = async ({deployments, getNamedAccounts}) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()

    //basic nft
    const basicNft = await ethers.getContract("BasicNft")
    const basicMintTx = await basicNft.mintNft()
    await basicMintTx.wait(1)
    console.log(`Basic nft index 0 tokenURI ${await basicNft.tokenURI(0)}`)

 
    // Dynamic SVG  NFT
    const highValue = ethers.utils.parseEther("4000")
    const dynamicSvgNft = await ethers.getContract("DynamicSvgNft", deployer)
    const dynamicSvgNftMintTx = await dynamicSvgNft.mintNft(highValue)
    await dynamicSvgNftMintTx.wait(1)
    console.log(
        `Dynamic SVG NFT index 0 tokenURI: ${await dynamicSvgNft.tokenURI(1)}`
    )

    // Random IPFS NFT
    const randomIpfsNft = await ethers.getContract("RandomIpfsNft", deployer)
    const mintFee = await randomIpfsNft.getMintFee()
    const randomIpfsNftMintTx = await randomIpfsNft.requestNft({
        value: mintFee.toString(),
    })
    const randomIpfsNftMintTxReceipt = await randomIpfsNftMintTx.wait(1)
    // Need to listen for response
    await new Promise(async (resolve) => {
        setTimeout(resolve, 300000) // 5 minute timeout time
        // setup listener for our event
        randomIpfsNft.once("NftMinted", async () => {
            resolve()
        })
        if (developmentChains.includes(network.name)) {
            const requestId =
                randomIpfsNftMintTxReceipt.events[1].args.requestId.toString()
            const vrfCoordinatorV2Mock = await ethers.getContract(
                "VRFCoordinatorV2Mock",
                deployer
            )
            await vrfCoordinatorV2Mock.fulfillRandomWords(
                requestId,
                randomIpfsNft.address
            )
        }
    })
    console.log(
        `Random IPFS NFT index 0 tokenURI: ${await randomIpfsNft.tokenURI(0)}`
    )
}
module.exports.tags=["all","mint"]