import { ethers } from 'ethers';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

const ABI = [
  "function createProof(string _submissionId, string _studentIdHash, string _taskId, string _ipfsHash) external",
  "function getProof(string _submissionId) external view returns (tuple(string studentIdHash, string taskId, string ipfsHash, address mentor, uint256 timestamp))"
];

export async function POST(req: Request) {
  try {
    const { submissionId, studentId, taskId, ipfsHash } = await req.json();

    if (!submissionId || !studentId || !taskId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    const rpcUrl = process.env.NEXT_PUBLIC_POLYGON_RPC_URL;
    const privateKey = process.env.PRIVATE_KEY;
    const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

    if (!rpcUrl || !privateKey || !contractAddress) {
      throw new Error('Blockchain configuration missing in environment variables');
    }

    // 1. Initialize Blockchain Provider & Wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, ABI, wallet);

    // 2. Hash student ID for privacy if needed (optional, using raw for now as per contract)
    const studentIdHash = ethers.id(studentId); // Standard SHA-256 equivalent in ethers

    console.log(`Starting real blockchain transaction for submission: ${submissionId}`);

    // 3. Send Transaction
    // Note: We use the submissionId as the primary key in the contract
    const tx = await contract.createProof(
      submissionId,
      studentIdHash,
      taskId,
      ipfsHash || "no-ipfs-hash"
    );

    console.log(`Transaction sent: ${tx.hash}. Waiting for confirmation...`);

    // 4. Wait for confirmation (1 block is enough for proof-of-concept)
    const receipt = await tx.wait(1);

    return NextResponse.json({
      success: true,
      transactionHash: tx.hash,
      blockNumber: receipt.blockNumber
    });

  } catch (error: any) {
    console.error('Blockchain Transaction Failed:', error);
    
    // Check for specific common errors
    if (error.message.includes('insufficient funds')) {
      return NextResponse.json({ 
        error: 'The verification wallet has insufficient MATIC for gas fees. Please top up the wallet.',
        details: error.message 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      error: 'Blockchain transaction failed', 
      details: error.message 
    }, { status: 500 });
  }
}
