import ContractDeployerFactory from '../helpers/deploy';

async function main() {
  const factory = new ContractDeployerFactory();

  const token = await factory
    .createContractDeployer('GLDToken', [1000])
    .deploy();
  if (token == null) throw new Error('Token not deployed');
  const gldExchange = await factory
    .createContractDeployer('GLDExchange', [token.address])
    .deploy();
  const nft = await factory.createContractDeployer('GameNFT', []).deploy();
  if (nft == null) throw new Error('NFT not deployed');
  const gameEscrow = await factory
    .createContractDeployer('GameEscrow', [token.address, nft.address])
    .deploy();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
