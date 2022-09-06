import { expect } from 'chai';
import { ethers } from 'hardhat';

import ContractDeployerFactory from '../helpers/deploy';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { EtherEscrow } from '../typechain';

const factory = new ContractDeployerFactory();
// For each smart contract you should call new global describe function

describe('Escrow', () => {
  let accountA: SignerWithAddress;
  let accountB: SignerWithAddress;
  let escrow: EtherEscrow;
  beforeEach(async () => {
    [accountA, accountB] = await ethers.getSigners();
    const Escrow = await ethers.getContractFactory('EtherEscrow');
    escrow = await Escrow.deploy();
  });

  it('should have proper address', async () => {
    expect(escrow.address).to.be.properAddress;
  });

  //send ether to the contract
  it('should send true balance', async () => {
    const balance = await escrow.provider.getBalance(escrow.address);
    expect(balance).to.eq(0);
    expect(await escrow.getEtherBalance()).to.eq(0);
    const amount = ethers.utils.parseEther('1.0');
    await escrow
      .connect(accountA)
      .sendEther(accountB.address, { value: amount });
    expect(await escrow.getEtherBalance()).to.eq(amount);
  });

  it('should send ether to the contract and be able to do withdrawal', async () => {
    const amount = ethers.utils.parseEther('1');
    await escrow
      .connect(accountA)
      .sendEther(accountB.address, { value: amount });
    expect(await escrow.getEtherBalance()).to.eq(amount);
    const initialBalance = await escrow.provider.getBalance(accountB.address);
    await escrow.connect(accountB).withdrawEther();
    expect(await escrow.getEtherBalance()).to.eq(0);
    const finalBalance = await escrow.provider.getBalance(accountB.address);
    expect(finalBalance).gt(initialBalance);
  });

  it('should send ether to the contract and be able to rollback', async () => {
    const amount = ethers.utils.parseEther('1');
    await escrow
      .connect(accountA)
      .sendEther(accountB.address, { value: amount });
    expect(await escrow.getEtherBalance()).to.eq(amount);
    await escrow
      .connect(accountA)
      .sendEther(accountB.address, { value: amount });
    expect(await escrow.getEtherBalance()).to.eq(amount.mul(2));
    await escrow.connect(accountA).rollbackEther(accountB.address);
    expect(await escrow.getEtherBalance()).to.eq(0);
  });

  it('should be reverted if there is no ether to withdraw', async () => {
    await expect(escrow.connect(accountB).withdrawEther()).to.be.revertedWith(
      "You don't have ethers sent to you"
    );
  });

  it('should be reverted if there is no ether to rollback', async () => {
    await expect(
      escrow.connect(accountB).rollbackEther(accountA.address)
    ).to.be.revertedWith(
      'Rollback is not available for you. Ethers might be already withdrawed'
    );
  });

  it('should be reverted if there is no ether to rollback but sent 0 wei', async () => {
    await escrow.connect(accountA).sendEther(accountB.address, { value: 0 });
    await expect(
      escrow.connect(accountA).rollbackEther(accountB.address)
    ).to.be.revertedWith(
      'Rollback is not available for you. Ethers might be already withdrawed'
    );
  });
});
