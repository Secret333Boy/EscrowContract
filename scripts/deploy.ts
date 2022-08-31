import ContractDeployerFactory from '../helpers/deploy';

async function main() {
    const factory = new ContractDeployerFactory();

    let token;
    let nft;
    if (!process.env.TOKEN_ADDR) token = await factory.createContractDeployer('Token', [1000]).deploy();
    if (!process.env.NFT_ADDR) nft = await factory.createContractDeployer('XcNFT', [
        'NFTest',
        'NF1',
        'ipfs://nohash'
    ]).deploy();


    await factory.createContractDeployer('Staker', [
        process.env.LP_WALLET_ADDR,
        process.env.TOKEN_ADDR ?? token?.address,
        process.env.NFT_ADDR ?? nft?.address,
        {
            t1: {
                chance: 100,
                drop: 500,
            },
            t2: {
                chance: 60,
                drop: 400,
            },
            t3: {
                chance: 50,
                drop: 300,
            },
            t4: {
                chance: 30,
                drop: 200,
            },
            t5: {
                chance: 20,
                drop: 100,
            },
        }
    ]).deploy();
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
