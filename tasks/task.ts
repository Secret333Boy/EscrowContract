import { task } from 'hardhat/config';

task('accounts', 'Prints the list of accounts')
  .addParam('account', "The account's address")
  .setAction(async () => {
    console.log(1);
  });

export {};
