import { ethers } from "hardhat";
import { ILogger } from "../types";
import * as fs from "fs";
import path from "path";

export class CopyService {
  fromDir: string;
  toDir: string;
  constructor(private logger: ILogger) {
    const currentDir = path.resolve("../");
    this.fromDir = currentDir + "/contracts/artifacts/contracts";
    this.toDir = currentDir + "/frontend/src/contracts/abis";
  }
  copy(fileName: string): void {
    const fullInputPath = `${this.fromDir}/${fileName}.sol/${fileName}.json`;
    const fullOutputPath = `${this.toDir}/${fileName}.json`;

    fs.copyFile(fullInputPath, fullOutputPath, (err) => {
      if (err) {
        this.logger.error(err.message);
        throw err;
      }
      this.logger.log("Your contract's ABI was copied to the frontend");
    });
  }
}
export class ContractDeployer<C extends string> {
  currentNetwork: string | undefined;
  constructor(
    private contactName: C,
    private args: any[] = [],
    private logger: ILogger,
    private copyService: CopyService
  ) {
    this.currentNetwork = process.env.HARDHAT_NETWORK;
  }

  addDeployedAddress(address: string): void {
    const currentDir = path.resolve("../");
    const filePath = currentDir + "/frontend/src/contracts/adresses.json";
    const rawData = fs.readFileSync(filePath, "utf8");
    const addresses = JSON.parse(rawData);
    addresses[this.contactName] = address;
    fs.writeFileSync(filePath, JSON.stringify(addresses));
  }
  async deploy() {
    try {
      const Contract = await ethers.getContractFactory(this.contactName);
      // eslint-disable-next-line prefer-spread
      const deploy = await Contract.deploy.apply(Contract, this.args as any);
      await deploy.deployed();
      this.copyService.copy(this.contactName);
      this.addDeployedAddress(deploy.address);
      this.logger.log(
        `
        ✅ ${this.contactName} has been deployed to network: ${this.currentNetwork}. \n
        Address: ${deploy.address}
        `
      );
      return deploy;
    } catch (e: any) {
      this.logger.error(
        `
        🆘 ${this.contactName} has not been deployed to network: ${this.currentNetwork}. \n
        Reason: ${e.message}
        `
      );
      throw e;
    }
  }
}

export default class ContractDeployerFactory {
  constructor(
    private logger: ILogger = console,
    private copyService: CopyService = new CopyService(console)
  ) {}

  public createContractDeployer<C extends string>(
    contactName: C,
    args: any[]
  ): ContractDeployer<C> {
    return new ContractDeployer(
      contactName,
      args,
      this.logger,
      this.copyService
    );
  }
}
