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
  const provider = new AnchorProvider(connection, anchorWallet, {
    preflightCommitment: 'processed',
  });

  const PROGRAM_ID = new web3.PublicKey(idl.metadata.address);
  const program = new Program(idl, idl.metadata.address, provider);

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

  console.log('reciever');
  console.log(reciever.toBase58());
  const [userMintTokenAccount] = web3.PublicKey.findProgramAddressSync(
    [reciever.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), MINT.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );

  let initilized = false;
  try {
    const banal = await connection.getBalance(userMintTokenAccount);
    if (banal > 0) {
      initilized = true;
    }
  } catch (e) {}

  if (!initilized) {
    // need a function that make the user create a an associated token account
    // Create token account to hold your wrapped SOL
    const ataTransaction = new web3.Transaction().add(
      createAssociatedTokenAccountInstruction(
        // createAssociatedTokenAccountInstruction(
        anchorWallet.publicKey,
        userMintTokenAccount,
        reciever,
        MINT! 
      )
    );
    const signature = await wallet.sendTransaction(ataTransaction, connection);
    await connection.confirmTransaction(signature, 'finalized');
  }

  const [NexusEscrowTokenAccount] = web3.PublicKey.findProgramAddressSync(
    [nexusEscrow.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), MINT.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );

  console.log(escrow.toBase58());

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
  // .rpc({
  //     commitment: "confirmed",
  // })

  const blockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.recentBlockhash = blockhash;
  tx.feePayer = anchorWallet.publicKey;

  await wallet.sendTransaction(tx, connection, {
    preflightCommitment: 'confirmed',
  });

  const dummyDbId = 'xxx';
  const dummyStatusUpdate = 'Success';
  const apiResponse = await backendApi.patch(
    `/freelancer/update/${apply.toBase58()}`,
    { status: dummyStatusUpdate }
  );
  //   if(!apiResponse) {console.log('Do something')}
  console.log(apiResponse);

  return tx;
}
