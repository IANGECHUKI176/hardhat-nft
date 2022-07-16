const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("basicNft", function () {
          let deployer, basicNft
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["basicNft"])
              basicNft = await ethers.getContract("BasicNft",deployer)
          })
          it("Allows users to mint an NFT, and updates appropriately", async function () {
              const txResponse = await basicNft.mintNft()
              await txResponse.wait(1)
              const tokenURI = await basicNft.tokenURI(0)
              const tokenCounter = await basicNft.getTokenCounter()
              assert.equal(tokenCounter.toString(), "1")
              assert.equal(tokenURI, await basicNft.TOKEN_URI())
            
          })
      })
