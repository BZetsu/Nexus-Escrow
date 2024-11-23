import { backendApi } from '@/lib/utils/api.util';
import { AnchorProvider, BN, Program, web3 } from '@project-serum/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import {
  MINT,
  NEXUSESCROW_V1,
  SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID,
  USER_PREFIX,
} from '../../constants/constants';
const idl = require('../../../data/nexus.json');

/**
    contact_name: String,
    deadline: i64,
    amount: u64,
    telegram_link: String,
    materials: String,
    description: String,
 */

export async function initEscrow(
  anchorWallet: any,
  connection: web3.Connection,
  contact_name: string,
  telegram_link: string,
  materials: string,
  description: string,
  amount: number,
  deadline: number,
  privat: boolean,
  wallet: any
) {
  console.log("privat")
  console.log(privat)
  const provider = new AnchorProvider(connection, anchorWallet, {
    preflightCommitment: 'processed',
  });

  const PROGRAM_ID = new web3.PublicKey(idl.metadata.address);
  const program = new Program(idl, idl.metadata.address, provider);

  const [founder] = web3.PublicKey.findProgramAddressSync(
    [anchorWallet.publicKey.toBuffer(), Buffer.from(USER_PREFIX)],
    PROGRAM_ID
  );

  const [escrow] = web3.PublicKey.findProgramAddressSync(
    [anchorWallet.publicKey.toBuffer(), Buffer.from(contact_name)],
    PROGRAM_ID
  );

  const [nexusEscrow] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(NEXUSESCROW_V1)],
    PROGRAM_ID
  );

  console.log(nexusEscrow.toBase58());

  const [userMintTokenAccount] = web3.PublicKey.findProgramAddressSync(
    [
      anchorWallet.publicKey.toBuffer(),
      TOKEN_PROGRAM_ID.toBuffer(),
      MINT.toBuffer(),
    ],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );

  const [NexusEscrowTokenAccount] = web3.PublicKey.findProgramAddressSync(
    [nexusEscrow.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), MINT.toBuffer()],
    SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
  );

  console.log(NexusEscrowTokenAccount.toBase58())

  const tx = await program.methods
    .initEscrow({
      contractName: contact_name,
      deadline: new BN(deadline),
      amount: new BN(amount * 1_000_000),
      telegramLink: telegram_link,
      materials: materials,
      description: "description",
    })

    .accounts({
      escrow: escrow,
      from: userMintTokenAccount,
      to: NexusEscrowTokenAccount,
      mint: MINT,
      founder: founder,
      authority: anchorWallet.publicKey,
      nexusEscrow: nexusEscrow,
      systemProgram: web3.SystemProgram.programId,
    })
    .transaction()
  // .rpc({
  //   commitment: 'confirmed',
  // });

  const blockhash = (await connection.getLatestBlockhash()).blockhash
  tx.recentBlockhash = blockhash;
  tx.feePayer = anchorWallet.publicKey;


  const signTx = await wallet.signTransaction(tx);

  const hash = await connection.sendRawTransaction(signTx.serialize());
  console.log(hash);

  const apiResponse = await backendApi.post('/escrow/init', {
    contactName: contact_name,
    deadline,
    amount,
    telegramLink: telegram_link,
    materials,
    description,
    escrowAddress: escrow.toBase58(),
    private: privat
  });
  //   if(!apiResponse) {console.log('Do something')}

  console.log(apiResponse)

  // return tx;
}
