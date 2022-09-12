import { Contract, ethers, Wallet } from 'ethers';
import ContractDeployerFactory from '../helpers/deploy';
import { ExchangeFactory, Exchange, ERC20 } from '../typechain';
import exchangeInfo from '../artifacts/contracts/Exchange.sol/Exchange.json';
import exchangeFactoryInfo from '../artifacts/contracts/ExchangeFactory.sol/ExchangeFactory.json';

async function main() {
  const factory = new ContractDeployerFactory();

  factory.createContractDeployer('', []).copyService.copy('Exchange');
  const GLDToken = (await factory
    .createContractDeployer('GLDToken', ['1000000000000000000'])
    .deploy()) as Contract & ERC20;
  if (!GLDToken) throw new Error('GLDToken not deployed');
  const SLVToken = (await factory
    .createContractDeployer('SLVToken', ['1000000000000000000'])
    .deploy()) as Contract & ERC20;
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
  const GLDExchange = new ethers.Contract(
    await ExchangeFactoryContract.getExchange(GLDToken.address),
    exchangeInfo.abi,
    wallet
  ) as Contract & Exchange;
  const SLVExchange = new ethers.Contract(
    await ExchangeFactoryContract.getExchange(SLVToken.address),
    exchangeInfo.abi,
    wallet
  ) as Contract & Exchange;
  console.log('Retrieved exchanges...');

  await (
    await GLDToken.approve(GLDExchange.address, '500000000000000000')
  ).wait();
  await (
    await GLDExchange.addLiquidity('500000000000000000', {
      value: '2000000000000000000',
    })
  ).wait();
  console.log('GLD Token Liquidity done');

  await (
    await SLVToken.approve(SLVExchange.address, '500000000000000000')
  ).wait();
  await (
    await SLVExchange.addLiquidity('500000000000000000', {
      value: '1000000000000000000',
    })
  ).wait();
  console.log('SLV Token Liquidity done');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
