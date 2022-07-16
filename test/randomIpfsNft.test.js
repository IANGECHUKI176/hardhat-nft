const { assert, expect } = require("chai")
const { network, getNamedAccounts, deployments, ethers } = require("hardhat")
const { developmentChains } = require("../helper-hardhat-config")

!developmentChains.includes(network.name)
    ? describe.skip
    : describe("Random Nft tests", () => {
          let deployer, RandomIpfsNft, vrfCoordinatorMock, mintFee
          beforeEach(async () => {
              deployer = (await getNamedAccounts()).deployer
              await deployments.fixture(["all"])
              RandomIpfsNft = await ethers.getContract(
                  "RandomIpfsNft",
                  deployer
              )
              vrfCoordinatorMock = await ethers.getContract(
                  "VRFCoordinatorV2Mock",
                  deployer
              )
              mintFee = await RandomIpfsNft.getMintFee()
          })
          describe("constructor", () => {
              it("ensures all values in constructor are initalized correctly", async () => {
                  assert.equal(mintFee.toString(), ethers.utils.parseEther("0.01").toString())
                  assert.equal(
                      await RandomIpfsNft.getDogTokenUris(0),
                      "ipfs://QmPsddgwx2s4HE5V9so61eSR3NfGgJMkHgpTRBw1jnmTrH"
                  )
                  assert.equal(await RandomIpfsNft.getTokenCounter(), "0")
              })
          })
          describe("Request Nft", () => {
              it("Reverts if you don't pay enough ETH", async () => {
                  await expect(RandomIpfsNft.requestNft()).to.be.revertedWith(
                      "RandomIpfsNft__NeedMoreETHSent"
                  )
              })
              it("emits an event on request nft", async () => {
                  await expect(
                      RandomIpfsNft.requestNft({ value: mintFee })
                  ).to.emit(RandomIpfsNft, "NftRequested")
              })
              it("returns a requestId on random word request", async () => {
                  const txResponse = await RandomIpfsNft.requestNft({
                      value: mintFee,
                  })
                  const txReceipt = await txResponse.wait(1)
                  const requestId = await txReceipt.events[1].args.requestId
                  const senderAddress = await RandomIpfsNft.getMinterAddress(
                      requestId
                  )
                  assert.equal(senderAddress, deployer)
                  assert.equal(requestId, 1)
              })
          })
          describe("fulfill Random Words", () => {
              it("emits an event when winner is picked", async () => {
                  await RandomIpfsNft.requestNft({ value: mintFee })
                  await new Promise(async (resolve, reject) => {
                      RandomIpfsNft.once("NftMinted", async () => {
                          console.log("event fired")
                          try {
                              const endingCounterValue =
                                  await RandomIpfsNft.getTokenCounter()
                              assert.equal(endingCounterValue.toString(), "1")
                              resolve()
                          } catch (error) {
                              reject(error)
                          }
                      })
                      //setting up listener
                      //below w'll fire the event and listener will pick it up and resolve it

                      try {
                          const txResponse = await RandomIpfsNft.requestNft({
                              value: mintFee,
                          })
                          const txReceipt = await txResponse.wait(1)
                          const requestId = txReceipt.events[1].args.requestId
                          await vrfCoordinatorMock.fulfillRandomWords(
                              requestId,
                              RandomIpfsNft.address
                          )
                      } catch (error) {
                          reject(error)
                      }
                  })
              })
          })
     
      })
