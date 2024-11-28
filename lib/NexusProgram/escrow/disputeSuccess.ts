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

interface ReceiverInfo {
  name: string;
  image: string;
  twitter: string;
  telegramId: string;
  profileOverview: string;
  levelOfExpertise: string;
  category: string;
  publicKey: web3.PublicKey;
}

export async function disputeSuccess(
  anchorWallet: any,
  connection: web3.Connection,
  wallet: any,
  escrow: web3.PublicKey,
  receiver: ReceiverInfo
) {
  const provider = new AnchorProvider(connection, anchorWallet, {
    preflightCommitment: 'processed',
  });

  const PROGRAM_ID = new web3.PublicKey(idl.metadata.address);
  const program = new Program(idl, idl.metadata.address, provider);

  const [nexusEscrow] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(NEXUSESCROW_V1)],
    PROGRAM_ID
  );

  const userInfo = await get_userr_info(anchorWallet, connection, receiver.publicKey);

  const [userMintTokenAccount] = web3.PublicKey.findProgramAddressSync(
    [
      receiver.publicKey.toBuffer(),
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
    [receiver.publicKey.toBuffer(), escrow.toBuffer()],
    PROGRAM_ID
  );

  const tx = await program.methods
    .disputeSuccess()
    .accounts({
      escrow: escrow,
      reciever: receiver.publicKey,
      recieverAddress: receiver.publicKey,
      authority: anchorWallet.publicKey,
      from: NexusEscrowTokenAccount,
      to: userMintTokenAccount,
      mint: MINT,
      nexusEscrow: nexusEscrow,
      tokenProgram: TOKEN_PROGRAM_ID,
      systemProgram: web3.SystemProgram.programId,
    })
    .transaction();

  const blockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.recentBlockhash = blockhash;
  tx.feePayer = anchorWallet.publicKey;

  const signTx = await wallet.signTransaction(tx);
  const hash = await connection.sendRawTransaction(signTx.serialize());

  const dummyStatusUpdate = 'DisputeSuccess';
  const apiResponse = await backendApi.patch(
    `/freelancer/update/${apply.toBase58()}`,
    { status: dummyStatusUpdate }
  );

  return tx;
}
