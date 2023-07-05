const { ethers } = require('ethers');

// Replace the following with your contract's ABI and address
const contractABI = [...]; // Contract's ABI (JSON format)
const contractAddress = '0x...'; // Contract's address

// Replace the following with your Ethereum node provider URL
const providerURL = 'https://ropsten.infura.io/v3/YOUR_INFURA_PROJECT_ID';

async function main() {
  try {
    // Create an ethers.js provider connected to an Ethereum node
    const provider = new ethers.providers.JsonRpcProvider(providerURL);

    // Replace the following with your wallet's private key or JSON-RPC URL if using a public node
    const privateKey = 'YOUR_PRIVATE_KEY';

    // Create a new signer with the private key
    const wallet = new ethers.Wallet(privateKey, provider);

    // Load the contract ABI and address into a Contract instance
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    console.log('Contract fetched:', contract.address);
  } catch (error) {
    console.error(error);
  }
}

main();

