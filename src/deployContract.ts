const output = require("../bin/src/DataStorage.json");
const ABI = output.abi;
const bytecode = output.bytecode;
import * as ethers from "ethers";
import config from "./config";

const deploy = async function () {
  try {
    // const provider = new ethers.providers.AlchemyProvider("goerli", YOUR_ALCHEMY_API_KEY);
    const provider = new ethers.providers.InfuraProvider(
      "goerli",
      config.INFURA_API_KEY
    );
    const Wallet = new ethers.Wallet(
      config.METAMASK_WALLET_ACCOUNT_PRIVATE_KEY,
      provider
    );
    const ContractInstance = new ethers.ContractFactory(ABI, bytecode, Wallet);
    const contractInstance = await ContractInstance.deploy();
    const deployedData = await contractInstance.deployed();

    console.log("=================contractInstance=================");
    console.log("Deployed contract address - ", contractInstance.address);

    console.log("=================deployedData=================");
    console.log(deployedData);

    // const setNameInitialResponse = await contractInstance.setName("testContractMy");
    // await setNameInitialResponse.wait();
    // const contractReturnedString = await contractInstance.getName();
    // console.log("Output value of getName() function " + "of solidity Smart contract - ", contractReturnedString);
  } catch (err) {
    console.log("Error in deploying contract.");
    console.log(err);
  }
};

deploy();
