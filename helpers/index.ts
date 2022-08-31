import { ethers } from 'ethers';
export const toWei = (value: number) =>
    ethers.utils.parseEther(value.toString());
