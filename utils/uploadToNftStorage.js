// Import the NFTStorage class and File constructor from the 'nft.storage' package
const { NFTStorage, File } = require("nft.storage")
const mime = require("mime")
const fs = require("fs")
const path = require("path")
require("dotenv").config()

const NFT_STORAGE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJkaWQ6ZXRocjoweDRlNzZGNTliQ0QxOTk3NUZDQkYwN0E3RDNGMjBlOTRCYWFlMkU5MDUiLCJpc3MiOiJuZnQtc3RvcmFnZSIsImlhdCI6MTY1NzU2MzQwMTYwNiwibmFtZSI6ImhhcmRoYXQtbmZ0In0.UO2oEQnemjMWSH1cOoespC2ToMwyjQHV_s2BYU0wCuM"

/**
 * Reads an image file from `imagePath` and stores an NFT with the given name and description.
 * @param {string} imagePath the path to an image file
 * @param {string} name a name for the NFT
 * @param {string} description a text description for the NFT
 */
async function storeNFTs(imagesPath) {
    const fullImagesPath = path.resolve(imagesPath)
    const files = fs.readdirSync(fullImagesPath)
    let responses = []
    for (fileIndex in files) {
        const image = await fileFromPath(
            `${fullImagesPath}/${files[fileIndex]}`
        )
        console.log(image)
        const nftstorage = new NFTStorage({ token: NFT_STORAGE_KEY });
        const dogName = files[fileIndex].replace(".png", "");
        const response = await nftstorage.store({
          image,
          name: dogName,
          description: `An adorable ${dogName}`,
          // Currently doesn't support attributes 😔
          // attributes: [{ trait_type: "cuteness", value: 100 }],
        });
        responses.push(response);
    }
    //return responses;
}

/**
 * A helper to read a file from a location on disk and return a File object.
 * Note that this reads the entire file into memory and should not be used for
 * very large files.
 * @param {string} filePath the path to a file to store
 * @returns {File} a File object containing the file content
 */
async function fileFromPath(filePath) {
    const content = await fs.promises.readFile(filePath)
    const type = mime.getType(filePath)
    return new File([content], path.basename(filePath), { type })
}


// [
//   Token {
//     ipnft: 'bafyreie2xxsm54qkll5qcy6dlbd7dbmfw4i5rcxqt3obf67obg2tbczdce',
//     url: 'ipfs://bafyreie2xxsm54qkll5qcy6dlbd7dbmfw4i5rcxqt3obf67obg2tbczdce/metadata.json'
//   },
//   Token {
//     ipnft: 'bafyreidjon3dev4wchs47fxebbfrqy6hr7nt2i7l5fb4tqfn6jujjxoo3y',
//     url: 'ipfs://bafyreidjon3dev4wchs47fxebbfrqy6hr7nt2i7l5fb4tqfn6jujjxoo3y/metadata.json'
//   }
// ]
