const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const fs = require("fs")
const {
    developmentChains,
    lowSvgUri,
    highSvgUri,
    highTokenUri,
    lowTokenUri,
} = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Dynamic svg Nft tests", () => {
          let dynamicSvgNft, mockV3Aggregator, deployer
          beforeEach(async () => {
              deployer = (await getNamedAccounts).deployer
              await deployments.fixture(["all"])
              dynamicSvgNft = await ethers.getContract("DynamicSvgNft")
              mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
          })
          describe("constructor", () => {
              it("initializes everything correctly", async () => {
                  const lowSvg = await dynamicSvgNft.getLowSvg()
                  const highSvg = await dynamicSvgNft.getHighSvg()
                  const priceFeed = await dynamicSvgNft.getPriceFeed()
                  assert.equal(lowSvg, lowSvgUri)
                  assert.equal(highSvg, highSvgUri)
                  assert.equal(priceFeed, mockV3Aggregator.address)
              })
          })
          describe("mintNft", () => {
              it("emits an event when nft is minted", async () => {
                  const highValue = ethers.utils.parseEther("1") // 1 dollar per ether
                  await expect(dynamicSvgNft.mintNft(highValue)).to.emit(
                      dynamicSvgNft,
                      "CreatedNFT"
                  )
                  const tokenCounter = await dynamicSvgNft.getTokenCounter()
                  assert.equal(tokenCounter.toString(), "1")
                  const tokenUri = await dynamicSvgNft.tokenURI(1)
                  assert.equal(tokenUri, highTokenUri)
              })
              it("changes tokenuri to lower when price does surpass the high value", async () => {
                  const highValue =
                      ethers.utils.parseEther("100000000000000000") //100,000,000 dollars per ETH
                  const txResponse = await dynamicSvgNft.mintNft(highValue)
                  await txResponse.wait(1)
                  const tokenuri = await dynamicSvgNft.tokenURI(1)
              })
          })
          describe("svgToImgUri", () => {
              it("encodes svg to base64 format", async () => {
                  const svgImage = await fs.readFileSync(
                      "./images/dynamicNft/frown.svg",
                      "utf8"
                  )
                  const text = await dynamicSvgNft.svgToImgUri(svgImage)
                  assert.equal(text, lowSvgUri)
              })
          })
          // probably want more tests checking the svg -> token URI conversion svgToImageURI
          // More coverage of course
          // Maybe some tokenURI oddities
      })
