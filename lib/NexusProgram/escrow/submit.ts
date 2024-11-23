import { backendApi } from '@/lib/utils/api.util';
import { AnchorProvider, BN, Program, web3 } from '@project-serum/anchor';
import { NEXUSESCROW_V1, USER_PREFIX } from '../../constants/constants';
import { get_userr_info } from './utils.ts/get_userr_info';
const idl = require('../../../data/nexus.json');

export async function submit(
  anchorWallet: any,
  connection: web3.Connection,
  wallet: any,
  escrow: web3.PublicKey,
  submission: string
) {
  const provider = new AnchorProvider(connection, anchorWallet, {
    preflightCommitment: 'processed',
  });

  const PROGRAM_ID = new web3.PublicKey(idl.metadata.address);
  const program = new Program(idl, idl.metadata.address, provider);

  const [reciever] = web3.PublicKey.findProgramAddressSync(
    [anchorWallet.publicKey.toBuffer(), Buffer.from(USER_PREFIX)],
    PROGRAM_ID
  );

  const [apply] = web3.PublicKey.findProgramAddressSync(
    [anchorWallet.publicKey.toBuffer(), escrow.toBuffer()],
    PROGRAM_ID
  );

  
  // const [nexusEscrow] = web3.PublicKey.findProgramAddressSync(
  //     [
  //         Buffer.from(NEXUSESCROW_V1)
  //     ],
  //     PROGRAM_ID
  // );

  const tx = await program.methods
    .submit(submission)
    .accounts({
      escrow: escrow,
      reciever: reciever,
      authority: anchorWallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .transaction();
  // .rpc({
  //   commitment: 'confirmed',
  // });

  const blockhash = (await connection.getLatestBlockhash()).blockhash;
  tx.recentBlockhash = blockhash;
  tx.feePayer = anchorWallet.publicKey;

  await wallet.sendTransaction(tx, connection, {
    preflightCommitment: 'confirmed',
  });

  const apiResponse = await backendApi.post(
    `/escrow/submit/${escrow.toBase58()}`,
    {
      submission,
    }
  );
  console.log(apiResponse);
  //   if(!apiResponse) {console.log('Do something')}

  const dummyStatusUpdate = 'Submit';
  const apiResponse2 = await backendApi.patch(
    `/freelancer/update/${apply.toBase58()}`,
    { status: dummyStatusUpdate }
  );
  //   if(!apiResponse) {console.log('Do something')}
  console.log(apiResponse2);

  return tx;
}
