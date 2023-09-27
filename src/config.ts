import * as dotenv from "dotenv";
dotenv.config({ path: __dirname + '/.env' });

const config = {
    PORT: process.env.PORT as string,
    METAMASK_WALLET_ACCOUNT_PRIVATE_KEY: process.env.METAMASK_WALLET_ACCOUNT_PRIVATE_KEY as string,
    METAMASK_WALLET_ACCOUNT_PUBLIC_KEY: process.env.METAMASK_WALLET_ACCOUNT_PUBLIC_KEY as string,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS as string,
    INFURA_API_KEY: process.env.INFURA_API_KEY as string,
    PROVIDER_API: process.env.PROVIDER_API as string,
}

export default config;