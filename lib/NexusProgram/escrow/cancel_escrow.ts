import { AnchorProvider, Program, web3 } from '@project-serum/anchor';
import { MINT, NEXUSESCROW_V1, SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID, USER_PREFIX } from '../../constants/constants';
import { backendApi } from '@/lib/utils/api.util';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
const idl = require('../../../data/nexus.json');

/**
    deadline: i64,
 */

export async function cancelEscrow(
  anchorWallet: any,
  connection: web3.Connection,
  escrow: web3.PublicKey,
  wallet: any
) {
  const provider = new AnchorProvider(connection, anchorWallet, {
    preflightCommitment: 'processed',
  });

  const PROGRAM_ID = new web3.PublicKey(idl.metadata.address);
  const program = new Program(idl, idl.metadata.address, provider);

  const [founder] = web3.PublicKey.findProgramAddressSync(
    [anchorWallet.publicKey.toBuffer(), Buffer.from(USER_PREFIX)],
    PROGRAM_ID
  );

  console.log(escrow.toBase58());

  const [nexusEscrow] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(NEXUSESCROW_V1)],
    PROGRAM_ID
  );

  const [userMintTokenAccount] = web3.PublicKey.findProgramAddressSync(
    [anchorWallet.publicKey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), MINT.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );

  const [NexusEscrowTokenAccount] = web3.PublicKey.findProgramAddressSync(
    [nexusEscrow.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), MINT.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );

  const tx = await program.methods
    .cancelEscrow()
    .accounts({
      escrow: escrow,
      founder: founder,
      authority: anchorWallet.publicKey,
      from: NexusEscrowTokenAccount,
      to: userMintTokenAccount,
      mint: MINT,
      nexusEscrow: nexusEscrow,
      systemProgram: web3.SystemProgram.programId,
      tokenProgram: TOKEN_PROGRAM_ID,
    })
    .transaction()

    console.log(tx);
    // .rpc({
    //     commitment: "confirmed",
    // })
    const blockhash = (await connection.getLatestBlockhash()).blockhash;
    tx.recentBlockhash = blockhash;
    tx.feePayer = anchorWallet.publicKey;
  
    const signTx = await wallet.signTransaction(tx
        // connection, {
        // preflightCommitment: "confirmed"
    // }
)
    const hash = await connection.sendRawTransaction(signTx.serialize());
    console.log(hash);


  const apiResponse = await backendApi.delete(
    `/escrow/cancel/${escrow.toBase58()}`
  );
  //   if(!apiResponse) {console.log('Do something')}
  console.log(apiResponse);

  return tx;
}
