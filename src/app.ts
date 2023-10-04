import express, {
  Application,
  Request,
  Response,
  json,
  urlencoded,
} from "express";
import "dotenv/config";
import cors from "cors";
import { ethers } from "ethers";
import config from "./config";
const output = require("../bin/src/DataStorage.json");

const ABI = output.abi;
const provider = new ethers.providers.JsonRpcProvider(
  `https://goerli.infura.io/v3/${config.INFURA_API_KEY}`
);
const Wallet = new ethers.Wallet(
  config.METAMASK_WALLET_ACCOUNT_PRIVATE_KEY,
  provider
);

const newContract: any = new ethers.Contract(
  config.CONTRACT_ADDRESS,
  ABI,
  provider
);

const app: Application = express();
// using cors
app.use(cors({ credentials: false, origin: true }));

// parse data
app.use(json());
app.use(urlencoded({ extended: true }));

async function listenForDataCreatedEvent() {
  newContract.on(
    "DataCreated",
    (
      transactionHash: string,
      username: string,
      shipmentServiceCode: string,
      carrierName: string,
      createdAt: string,
      status: string,
      selectedRate: number,
      noOfInstallments: number,
      netPayable: number,
      paidAmount: number,
      insuranceAmount: number
    ) => {
      console.log("Data Created Event:");
      console.log("Transaction Hash:", transactionHash);
      console.log("Username:", username);
      console.log("Shipment Service Code:", shipmentServiceCode);
      console.log("Carrier Name:", carrierName);
      console.log("Created At:", createdAt);
      console.log("Status:", status);
      console.log("Selected Rate:", selectedRate);
      console.log("No of Installments:", noOfInstallments);
      console.log("Net Payable:", netPayable);
      console.log("Paid Amount:", paidAmount);
      console.log("Insurance Amount:", insuranceAmount);
    }
  );

  console.log("Listening for Data Created events...");
}

listenForDataCreatedEvent().catch((error) => {
  console.error("Error listening for events:", error);
});

app.get("/", async (req: Request, res: Response) => {
  try {
    const balance = await provider.getBalance(
      config.METAMASK_WALLET_ACCOUNT_PUBLIC_KEY
    );
    console.log(`My ETH balance is --> ${ethers.utils.formatEther(balance)}`);
    res.send("My server is running !");
  } catch (error) {
    console.log(error);
    res.send(error);
  }
});

// create shipment in blockchain
app.post(
  "/assign-shipment-in-blockchain",
  async (req: Request, res: Response) => {
    try {
      const {
        user_id,
        email,
        shipmentServiceCode,
        carrierName,
        createdAt,
        status,
        selectedRate,
        noOfInstallments,
        netPayable,
        insuranceAmount,
        paymentMethod,
        instalmentDeadLine,
        payableAmount,
        paymentDate,
        paidAmount,
      } = req.body;

      const contractWithWallet = newContract.connect(Wallet);
      const tx = await contractWithWallet.createData(
        user_id,
        email,
        shipmentServiceCode,
        carrierName,
        createdAt,
        status,
        selectedRate,
        noOfInstallments,
        netPayable,
        insuranceAmount,
        paymentMethod
      );
      await tx.wait();

      const transactionReceipt = await provider.getTransactionReceipt(tx.hash);

      if (paymentMethod === "BNPL") {
        const instalmentData = await contractWithWallet.setInstallmentData(
          transactionReceipt.logs[0]?.topics[1],
          instalmentDeadLine,
          payableAmount
        );
        await instalmentData.wait();

        const paidInstalment = await contractWithWallet.updateInstalment(
          // change this later
          transactionReceipt.logs[0]?.topics[1],
          paidAmount[0],
          paymentDate[0]
        );
        await paidInstalment.wait();
      }

      res.status(200).json({
        status: "success",
        data: {
          blockChainHash: transactionReceipt.logs[0]?.transactionHash,
          dataAccessHash: transactionReceipt.logs[0]?.topics[1],
        },
      });

      //   const result = await provider.getTransaction({
      //     to: config.CONTRACT_ADDRESS,
      //     data: tx.data,
      //   });
      // const iface = new ethers.utils.Interface(ABI);
      // let decodedData = iface.parseTransaction({
      //   data: tx.data,
      //   value: tx.value,
      // });

      // Decode the return data using the contract ABI
      // const decodedData = newContract.interface.decodeFunctionResult(
      //     transactionReceipt.logs[0].data
      // );

      // The decodedData will contain the JSON-like data
      // console.log(decodedData);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "error",
        data: error,
      });
    }
  }
);

// update shipment status
app.patch(
  "/update-shipment-status/:transactionHash",
  async (req: Request, res: Response) => {
    try {
      const contractWithWallet = newContract.connect(Wallet);
      const tx = await contractWithWallet.updateStatus(
        req.params.transactionHash,
        req.body.status
      );
      await tx.wait();

      res.status(200).json({
        status: "success",
        data: tx,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "error",
        data: error,
      });
    }
  }
);

// update shipment instalment
app.patch(
  "/update-shipment-instalment/:transactionHash",
  async (req: Request, res: Response) => {
    try {
      const contractWithWallet = newContract.connect(Wallet);
      // const tx = await contractWithWallet.updateInstalment(
      const tx = await contractWithWallet.updateInstalment(
        // change this later
        req.params.transactionHash,
        req.body.paidAmount,
        req.body.paidDate
      );
      await tx.wait();

      res.status(200).json({
        status: "success",
        data: tx,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "error",
        data: error,
      });
    }
  }
);

// transaction hash list for all shipment
app.get("/all-shipment-blockchain", async (req: Request, res: Response) => {
  try {
    // const balance = await newContract.balanceOf('0x6c6Bc977E13Df9b0de53b251522280BB72383700')
    // console.log(`Balance Returned: ${balance}`)
    // console.log(`Balance Formatted: ${ethers.utils.formatEther(balance)}\n`)

    // const shipmentList = await newContract.shipmentList();
    const shipmentList = await newContract.getAllData();

    res.status(200).json({
      status: "success",
      data: shipmentList,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      data: error,
    });
  }
});

// get shipment detail by transaction hash
app.get(
  "/get-detail/:transaction_hash",
  async (req: Request, res: Response) => {
    try {
      const { transaction_hash } = req.params;
      console.log(transaction_hash);

      // Get the transaction receipt
      // const transactionReceipt = await provider.getTransactionReceipt(
      //   transaction_hash
      // );

      const shipmentDetail = await newContract.getDataByTransactionHash(
        transaction_hash
      );

      const instalmentDetail =
        await newContract.getInstalmentDataByTransactionHash(transaction_hash);
      if (!shipmentDetail) {
        console.error("Transaction not found or not yet mined.");
        return;
      }

      const finalData = { ...shipmentDetail, ...instalmentDetail };

      res.status(200).json({
        status: "success",
        data: finalData,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        status: "error",
        data: error,
      });
    }
  }
);

app.get("/inspecting-block", async (req: Request, res: Response) => {
  try {
    const block = await provider.getBlockNumber();
    const blockInfo = await provider.getBlock(block);
    const { transactions } = await provider.getBlockWithTransactions(block);

    // console.log(`\nBlock Number: ${block}\n`)
    // console.log(blockInfo)
    // console.log(`\nLogging first transaction in block:\n`)
    // console.log(transactions[0])

    res.status(200).json({
      status: "success",
      data: {
        block: block,
        blockInfo: blockInfo,
        transactions: transactions,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      status: "error",
      data: error,
    });
  }
});

app.get("/get-shipment-by-id/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shipment = await newContract.userShipment(id);

    res.status(200).json({
      status: "success",
      data: shipment,
    });
  } catch (error) {
    // console.log(error);
    res.status(500).json({
      status: "error",
      data: error,
    });
  }
});

export default app;
