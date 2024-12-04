import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "solidity-coverage";
import dotenv from "dotenv";

dotenv.config();

const { PRIVATE_KEY } = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19", // You specified 0.8.19 here, so retain it
    settings: {
      optimizer: {
        enabled: true,
        runs: 10000, // Enables optimizer for reduced gas costs
      },
    },
  },
  typechain: {
    outDir: "typechain-types", // Typechain-generated types
    target: "ethers-v6", // Target Ethers.js v6
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545", // Hardhat local blockchain
    },
    gemini: {
      url: "https://rpc5.gemini.axiomesh.io", // Gemini network URL
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : [], // Load private key for deploying
    },
  },
};

export default config; // Use ESM-style export