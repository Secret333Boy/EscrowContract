import ContractDeployerFactory from '../helpers/deploy';

async function main() {
  const factory = new ContractDeployerFactory();

  const Token = await factory
    .createContractDeployer('GLDToken', [1000])
    .deploy();
  if (Token == null) throw new Error('Token not deployed');
  const ExchangeFactory = await factory
    .createContractDeployer('ExchangeFactory', [])
    .deploy();
  if (ExchangeFactory == null) throw new Error('ExchangeFactory not deployed');
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
