import { AnchorProvider, BN, Program, web3 } from '@project-serum/anchor';
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
} from '@solana/spl-token';
import {
  MINT,
  NEXUSESCROW_V1,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  USER_PREFIX,
} from '../../constants/constants';
import { get_userr_info } from './utils.ts/get_userr_info';
import { backendApi } from '@/lib/utils/api.util';
const idl = require('../../../data/nexus.json');

export async function approvePayment(
  anchorWallet: any,
  connection: web3.Connection,
  wallet: any,
  escrow: web3.PublicKey,
  reciever: web3.PublicKey
) {
  try {
    const provider = new AnchorProvider(connection, anchorWallet, {
      preflightCommitment: 'processed',
    });

    const PROGRAM_ID = new web3.PublicKey(idl.metadata.address);
    const program = new Program(idl, idl.metadata.address, provider);

    // Debug logs
    console.log("ApprovePayment Debug:", {
      escrowAddress: escrow.toBase58(),
      receiverAddress: reciever.toBase58(),
      walletAddress: anchorWallet.publicKey.toBase58()
    });

    const [_reciever] = web3.PublicKey.findProgramAddressSync(
      [reciever.toBuffer(), Buffer.from(USER_PREFIX)],
      PROGRAM_ID
    );

    const [nexusEscrow] = web3.PublicKey.findProgramAddressSync(
      [Buffer.from(NEXUSESCROW_V1)],
      PROGRAM_ID
    );

    const [apply] = web3.PublicKey.findProgramAddressSync(
      [reciever.toBuffer(), escrow.toBuffer()],
      PROGRAM_ID
    );

    const [userMintTokenAccount] = web3.PublicKey.findProgramAddressSync(
      [reciever.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), MINT.toBuffer()],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );

    const [NexusEscrowTokenAccount] = web3.PublicKey.findProgramAddressSync(
      [nexusEscrow.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), MINT.toBuffer()],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    );

    // Debug PDAs
    console.log("PDAs:", {
      _reciever: _reciever.toBase58(),
      nexusEscrow: nexusEscrow.toBase58(),
      apply: apply.toBase58(),
      userMintTokenAccount: userMintTokenAccount.toBase58(),
      NexusEscrowTokenAccount: NexusEscrowTokenAccount.toBase58()
    });

    // Check if token account exists
    let initilized = false;
    try {
      const balance = await connection.getBalance(userMintTokenAccount);
      initilized = balance > 0;
    } catch (e) {
      console.log("Token account check error:", e);
    }

    // Create token account if needed
    if (!initilized) {
      console.log("Creating token account...");
      const ataTransaction = new web3.Transaction().add(
        createAssociatedTokenAccountInstruction(
          anchorWallet.publicKey,
          userMintTokenAccount,
          reciever,
          MINT
        )
      );
      
      const latestBlockhash = await connection.getLatestBlockhash('confirmed');
      ataTransaction.recentBlockhash = latestBlockhash.blockhash;
      ataTransaction.feePayer = anchorWallet.publicKey;

      const signature = await wallet.sendTransaction(ataTransaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      console.log("Token account created:", signature);
    }

    // Build the approve payment transaction
    const tx = await program.methods
      .approvePayment()
      .accounts({
        escrow: escrow,
        from: NexusEscrowTokenAccount,
        to: userMintTokenAccount,
        mint: MINT,
        reciever: _reciever,
        recieverAddress: reciever,
        authority: anchorWallet.publicKey,
        nexusEscrow: nexusEscrow,
        systemProgram: web3.SystemProgram.programId,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .transaction();

    const latestBlockhash = await connection.getLatestBlockhash('confirmed');
    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.feePayer = anchorWallet.publicKey;

    // Send and confirm transaction
    const txSignature = await wallet.sendTransaction(tx, connection, {
      preflightCommitment: 'confirmed',
    });
    
    await connection.confirmTransaction(txSignature, 'confirmed');
    console.log("Transaction confirmed:", txSignature);

    // Update database
    const apiResponse = await backendApi.patch(
      `/freelancer/update/${apply.toBase58()}`,
      { status: 'Success' }
    );

    return tx;
  } catch (error) {
    console.error("ApprovePayment Error:", error);
    throw error;
  }
}
