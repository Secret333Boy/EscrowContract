import ContractDeployerFactory from "../helpers/deploy";

async function main() {
  const factory = new ContractDeployerFactory();

  let token;
  let nft;
  if (!process.env.TOKEN_ADDR)
    token = await factory.createContractDeployer("Token", [1000]).deploy();
  if (!process.env.NFT_ADDR)
    nft = await factory
      .createContractDeployer("XcNFT", ["NFTest", "NF1", "ipfs://nohash"])
      .deploy();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
