import { ethers } from 'ethers';
import * as snarkjs from 'snarkjs';

// ABI for AgeGate contract — only the functions we need
const AGEGATE_ABI = [
    "function verifyAge(uint[2] calldata _pA, uint[2][2] calldata _pB, uint[2] calldata _pC, uint[3] calldata _pubSignals) external",
    "function isVerified(address) external view returns (bool)",
    "function verifiedAt(address) external view returns (uint256)",
    "function checkVerification(address) external view returns (bool)",
    "function minAge() external view returns (uint256)",
    "event AgeVerified(address indexed user, uint256 timestamp)",
];

// Fallback public Sepolia RPC (in case VITE_SEPOLIA_RPC_URL is not set)
const FALLBACK_RPC = 'https://sepolia.drpc.org';

/**
 * Get a JsonRpcProvider using our Alchemy URL (bypasses MetaMask's built-in RPC).
 * This avoids the -32002 rate-limit error from MetaMask's public RPC.
 */
function getJsonProvider() {
    const rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || FALLBACK_RPC;
    return new ethers.JsonRpcProvider(rpcUrl);
}

/**
 * Connect MetaMask and return the user's address.
 * We only use MetaMask for account access and signing — NOT for RPC calls.
 */
export async function connectWallet() {
    if (!window.ethereum) {
        throw new Error('MetaMask bulunamadı! Lütfen MetaMask yükleyin.');
    }
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0]; // returns address string
}

/**
 * Verify age proof on-chain via AgeGate contract.
 * - RPC calls (gas, nonce, fees): Alchemy (JsonRpcProvider) — avoids public RPC limits
 * - Signing: MetaMask (eth_sendTransaction) — keeps private key safe in MetaMask
 *
 * @param {object} proof - Groth16 proof object
 * @param {string[]} publicSignals - Public signals array
 * @returns {Promise<{txHash: string, verified: boolean}>}
 */
export async function verifyOnChain(proof, publicSignals) {
    const contractAddress = import.meta.env.VITE_AGEGATE_ADDRESS;
    if (!contractAddress) {
        throw new Error('VITE_AGEGATE_ADDRESS ortam değişkeni tanımlı değil.');
    }

    // 1. Request MetaMask account access
    const userAddress = await connectWallet();

    // 2. Force MetaMask to switch to Sepolia (chainId 0xaa36a7 = 11155111)
    //    This prevents accidentally sending a mainnet transaction when on wrong network.
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0xaa36a7' }],
        });
    } catch (switchError) {
        // Chain not added to MetaMask yet — add it automatically
        if (switchError.code === 4902) {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0xaa36a7',
                    chainName: 'Sepolia Testnet',
                    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
                    rpcUrls: [import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://sepolia.drpc.org'],
                    blockExplorerUrls: ['https://sepolia.etherscan.io'],
                }],
            });
        } else {
            throw switchError;
        }
    }

    // 3. Use Alchemy/direct RPC for all network calls

    const provider = getJsonProvider();

    // 3. Convert proof to Solidity calldata
    const calldata = await snarkjs.groth16.exportSolidityCallData(proof, publicSignals);
    const [pA, pB, pC, pubSignals] = JSON.parse(`[${calldata}]`);

    // 4. Encode function call
    const iface = new ethers.Interface(AGEGATE_ABI);
    const data = iface.encodeFunctionData('verifyAge', [pA, pB, pC, pubSignals]);

    // 5. Fetch gas & fee data from Alchemy (NOT from MetaMask's RPC)
    const [gasLimit, feeData, nonce, network] = await Promise.all([
        provider.estimateGas({ from: userAddress, to: contractAddress, data }),
        provider.getFeeData(),
        provider.getTransactionCount(userAddress, 'pending'),
        provider.getNetwork(),
    ]);

    // Add 20% buffer to gas limit for safety
    const safeGasLimit = gasLimit * 120n / 100n;

    // 6. Build transaction — sign via MetaMask (eth_sendTransaction)
    const txParams = {
        from: userAddress,
        to: contractAddress,
        data,
        gas: ethers.toBeHex(safeGasLimit),
        maxFeePerGas: ethers.toBeHex(feeData.maxFeePerGas),
        maxPriorityFeePerGas: ethers.toBeHex(feeData.maxPriorityFeePerGas),
        nonce: ethers.toBeHex(nonce),
        chainId: ethers.toBeHex(network.chainId),
        type: '0x2', // EIP-1559
    };

    // MetaMask signs and broadcasts the transaction
    const txHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [txParams],
    });

    // 7. Wait for receipt using Alchemy provider
    const receipt = await provider.waitForTransaction(txHash, 1, 120_000);
    if (!receipt || receipt.status === 0) {
        throw new Error('İşlem başarısız oldu (kontrat revert).');
    }

    // 8. Check verification status via Alchemy
    const isVerifiedData = await provider.call({
        to: contractAddress,
        data: iface.encodeFunctionData('isVerified', [userAddress]),
    });
    const verified = BigInt(isVerifiedData) === 1n;

    return { txHash: receipt.hash, verified };
}

/**
 * Check if a user is already verified on-chain.
 * Also uses Alchemy directly to avoid MetaMask RPC issues.
 *
 * @param {string} address - User wallet address
 * @returns {Promise<{verified: boolean, timestamp: number}>}
 */
export async function checkOnChainStatus(address) {
    const contractAddress = import.meta.env.VITE_AGEGATE_ADDRESS;
    if (!contractAddress) return { verified: false, timestamp: 0 };

    try {
        const provider = getJsonProvider();
        const contract = new ethers.Contract(contractAddress, AGEGATE_ABI, provider);
        const [verified, timestamp] = await Promise.all([
            contract.isVerified(address),
            contract.verifiedAt(address),
        ]);
        return { verified, timestamp: Number(timestamp) };
    } catch {
        return { verified: false, timestamp: 0 };
    }
}
