import express, { Application, Request, Response, json, urlencoded } from "express";
import 'dotenv/config'
import cors from "cors";
import { ethers } from "ethers";
import config from "./config";

const output = require("../bin/src/Shipping.json");
const ABI = output.abi;
const provider = new ethers.providers.JsonRpcProvider(`https://goerli.infura.io/v3/${config.INFURA_API_KEY}`);
const Wallet = new ethers.Wallet(config.METAMASK_WALLET_ACCOUNT_PRIVATE_KEY, provider);

const newContract: any = new ethers.Contract(config.CONTRACT_ADDRESS, ABI, provider);

const app: Application = express();
// using cors
app.use(cors({ credentials: false, origin: true }));

// parse data
app.use(json());
app.use(urlencoded({ extended: true }));

app.get('/', async (req: Request, res: Response) => {
    try {
        const balance = await provider.getBalance(config.METAMASK_WALLET_ACCOUNT_PUBLIC_KEY);
        console.log(`My ETH balance is --> ${ethers.utils.formatEther(balance)}`);
        res.send('My server is running !')
    } catch (error) {
        console.log(error);
        res.send(error);
    }
})

app.post('/assign-shipment-in-blockchain', async (req: Request, res: Response) => {
    try {
        const { user_id, user_name, carrier_name, service_code, create_at, rate, status } = req.body;
        const contractWithWallet = newContract.connect(Wallet);
        const tx = await contractWithWallet.createShipment(config.METAMASK_WALLET_ACCOUNT_PUBLIC_KEY, user_id, user_name, carrier_name, service_code, create_at, rate, status);
        await tx.wait();

        const result = await provider.call({
            to: config.CONTRACT_ADDRESS,
            data: tx.data,
        });

        res.status(200).json({
            status: "success",
            data: tx,
            blockchainId: result
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            data: error
        });
    }
})

app.patch('/update-shipment/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const status = req.body.status;
    try {
        const contractWithWallet = newContract.connect(Wallet);
        const tx = await contractWithWallet.updateShipmentStatus(id, status);
        await tx.wait();

        res.status(200).json({
            status: "success",
            data: tx
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            data: error
        });
    }
})

app.get('/get-shipment-by-id/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const shipment = await newContract.userShipment(id);

        res.status(200).json({
            status: "success",
            data: shipment
        });
    } catch (error) {
        // console.log(error);
        res.status(500).json({
            status: "error",
            data: error
        });
    }
})

app.get('/all-shipment-blockchain', async (req: Request, res: Response) => {
    try {
        // const balance = await newContract.balanceOf('0x6c6Bc977E13Df9b0de53b251522280BB72383700')
        // console.log(`Balance Returned: ${balance}`)
        // console.log(`Balance Formatted: ${ethers.utils.formatEther(balance)}\n`)

        const shipmentList = await newContract.shipmentList();

        res.status(200).json({
            status: "success",
            data: shipmentList
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            data: error
        });
    }
})

app.get('/inspecting-block', async (req: Request, res: Response) => {
    try {
        const block = await provider.getBlockNumber();
        const blockInfo = await provider.getBlock(block);
        const { transactions } = await provider.getBlockWithTransactions(block)

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
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            data: error
        });
    }
})


app.get('/get-detail/:transaction_hash', async (req: Request, res: Response) => {
    try {
        const { transaction_hash } = req.params;
        console.log(transaction_hash);

        // Get the transaction receipt
        const transactionReceipt = await provider.getTransactionReceipt(transaction_hash);
        if (!transactionReceipt) {
            console.error('Transaction not found or not yet mined.');
            return;
        }

        // Decode the return data using the contract ABI
        // const decodedData = newContract.interface.decodeFunctionResult(
        //     transactionReceipt.logs[0].data
        // );

        // The decodedData will contain the JSON-like data
        // console.log(decodedData);


        res.status(200).json({
            status: "success",
            data: {
                block: transactionReceipt
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            status: "error",
            data: error
        });
    }
})


export default app;