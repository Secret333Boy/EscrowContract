import Web3 from "web3";
import * as dotenv from "dotenv";
dotenv.config();
const ethNetwork = process.env.ROPSTEN_URL || "";
const web3 = new Web3(new Web3.providers.HttpProvider(ethNetwork));

// let's fetch a balance

web3.eth.getBalance(
  "0x6635F83421Bf059cd8111f180f0727128685BaE4",
  async (err, result) => {
    if (err) {
      console.log(err);
      return;
    }
    const balance = web3.utils.fromWei(result, "ether");
    console.log(balance + " ETH");
  }
);
