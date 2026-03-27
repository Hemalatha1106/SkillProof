import { ethers } from 'ethers';

// You will need to replace this with your actual compiled contract ABI
const SkillProofABI = [
  "function createProof(string _submissionId, string _studentIdHash, string _taskId, string _ipfsHash) external",
  "function getProof(string _submissionId) external view returns (tuple(string studentIdHash, string taskId, string ipfsHash, address mentor, uint256 timestamp))",
  "event ProofCreated(string indexed submissionId, string studentIdHash, string taskId, string ipfsHash, address indexed mentor, uint256 timestamp)"
];

/**
 * Utility to verify a submission on the blockchain.
 * This should typically be called by the mentor (or backend acting on behalf of the system).
 */
export async function verifySubmissionOnChain(
  submissionId: string,
  studentIdHash: string,
  taskId: string,
  ipfsHash: string
) {
  if (!process.env.NEXT_PUBLIC_POLYGON_RPC_URL || !process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || !process.env.PRIVATE_KEY) {
    throw new Error("Missing Web3 environment variables");
  }

  const provider = new ethers.JsonRpcProvider(process.env.NEXT_PUBLIC_POLYGON_RPC_URL);
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  const contract = new ethers.Contract(process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, SkillProofABI, wallet);

  try {
    const tx = await contract.createProof(
      submissionId,
      studentIdHash,
      taskId,
      ipfsHash
    );

    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    return receipt.hash;
  } catch (error) {
    console.error("Blockchain verification failed:", error);
    throw error;
  }
}
