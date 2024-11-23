import { AnchorProvider, BN, Program, web3 } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  MINT,
  NEXUSESCROW_V1,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  USER_PREFIX,
} from '../../constants/constants';
import { get_userr_info } from './utils.ts/get_userr_info';
import { backendApi } from '@/lib/utils/api.util';
const idl = require('../../../data/nexus.json');

export async function disputeSuccess(
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

  // const [reciever] = web3.PublicKey.findProgramAddressSync(
  //     [
  //         anchorWallet.publicKey.toBuffer(),
  //         Buffer.from(USER_PREFIX),
  //     ],
  //     PROGRAM_ID
  // );

  const [nexusEscrow] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(NEXUSESCROW_V1)],
    PROGRAM_ID
  );

  const receiverInfo = await get_userr_info(anchorWallet, connection, reciever);

  console.log(escrow.toBase58());

  const [userMintTokenAccount] = web3.PublicKey.findProgramAddressSync(
    [
      receiverInfo!.address.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      MINT.toBuffer(),
    ],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );
  const [NexusEscrowTokenAccount] = web3.PublicKey.findProgramAddressSync(
    [nexusEscrow.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), MINT.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );

  const [apply] = web3.PublicKey.findProgramAddressSync(
    [reciever.toBuffer(), escrow.toBuffer()],
    PROGRAM_ID
  );

  const tx = await program.methods
    .disputeSuccess()
    .accounts({
      escrow: escrow,
      reciever: reciever,
      recieverAddress: receiverInfo!.address,
      authority: anchorWallet.publicKey,
      from: NexusEscrowTokenAccount,
      to: userMintTokenAccount,
      mint: MINT,
      nexusEscrow: nexusEscrow,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
    })
    .transaction();
  // .rpc({
  //     commitment: "confirmed",
  // })

  const blockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.recentBlockhash = blockhash;
  tx.feePayer = anchorWallet.publicKey;

  const signTx = await wallet.signTransaction(
    tx
    //     , connection, {
    //     preflightCommitment: "confirmed"
    // }
  );

  const hash = await connection.sendRawTransaction(signTx.serialize());
  console.log(hash);

  const dummyDbId = 'xxx';
  const dummyStatusUpdate = 'DisputeSuccess';
  const apiResponse = await backendApi.patch(
    `/freelancer/update/${apply.toBase58()}`,
    { status: dummyStatusUpdate }
  );
  //   if(!apiResponse) {console.log('Do something')}
  console.log(apiResponse);

  return tx;
}
