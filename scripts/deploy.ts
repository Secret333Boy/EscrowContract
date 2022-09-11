import { Contract, ethers, Wallet } from 'ethers';
import ContractDeployerFactory from '../helpers/deploy';
import { ExchangeFactory } from '../typechain';
import exchangeFactoryInfo from '../artifacts/contracts/ExchangeFactory.sol/ExchangeFactory.json';

async function main() {
  const factory = new ContractDeployerFactory();

  factory.createContractDeployer('', []).copyService.copy('Exchange');
  const GLDToken = await factory
    .createContractDeployer('GLDToken', [1000])
    .deploy();
  if (!GLDToken) throw new Error('GLDToken not deployed');
  const SLVToken = await factory
    .createContractDeployer('SLVToken', [1000])
    .deploy();
  if (!SLVToken) throw new Error('SLVToken not deployed');
  const ExchangeFactory = (await factory
    .createContractDeployer('ExchangeFactory', [])
    .deploy()) as Contract & ExchangeFactory;
  if (!ExchangeFactory) throw new Error('ExchangeFactory not deployed');
  const provider = new ethers.providers.InfuraProvider(
    process.env.NETWORK,
    process.env.INFURA_API_KEY
  );

  const wallet = new Wallet(process.env.PRIVATE_KEY as string, provider);
  const ExchangeFactoryContract = new ethers.Contract(
    ExchangeFactory.address,
    exchangeFactoryInfo.abi,
    wallet
  ) as Contract & ExchangeFactory;

  await (await ExchangeFactoryContract.createExchange(GLDToken.address)).wait();
  await (await ExchangeFactoryContract.createExchange(SLVToken.address)).wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
