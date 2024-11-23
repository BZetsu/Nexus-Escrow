import { backendApi } from '@/lib/utils/api.util';
import { AnchorProvider, BN, Program, web3 } from '@project-serum/anchor';
import { USER_PREFIX } from '../../constants/constants';
const idl = require('../../../data/nexus.json');

// pub struct ApplyInfo {
//     description: String,

// }

export async function FreelacerApply(
  anchorWallet: any,
  connection: web3.Connection,
  wallet: any,
  escrow: web3.PublicKey,
  amount: number,
  description: string,
  contactName: string,
  deadline: number
) {
  const provider = new AnchorProvider(connection, anchorWallet, {
    preflightCommitment: 'processed',
  });

  const PROGRAM_ID = new web3.PublicKey(idl.metadata.address);
  const program = new Program(idl, idl.metadata.address, provider);

  const [freelancer] = web3.PublicKey.findProgramAddressSync(
    [anchorWallet.publicKey.toBuffer(), Buffer.from(USER_PREFIX)],
    PROGRAM_ID
  );

  const [apply] = web3.PublicKey.findProgramAddressSync(
    [anchorWallet.publicKey.toBuffer(), escrow.toBuffer()],
    PROGRAM_ID
  );

  console.log(amount);
  console.log(contactName);
  console.log(description);

  const tx = await program.methods
    .freelancerApply({
      description,
    })
    .accounts({
      escrow: escrow,
      apply: apply,
      freelancer: freelancer,
      authority: anchorWallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .transaction();
  // .rpc({
  //   commitment: 'confirmed',
  // });

  const blockhash = (await connection.getLatestBlockhash()).blockhash
  tx.recentBlockhash = blockhash;
  tx.feePayer = anchorWallet.publicKey;

  // await wallet.sendTransaction(tx, connection, {
  //   preflightCommitment: "confirmed"
  // });

  const signTx = await wallet.signTransaction(tx);

  const hash = await connection.sendRawTransaction(signTx.serialize());
  console.log(hash);

  const apiResponse = await backendApi.post('/escrow/apply', {
    applicationAddress : apply.toBase58(),
    contactName,
    amount,
    description,
    createdAtUTC: Date.now(),
    escrowAddress: escrow.toBase58(),
    freelancerAddress: freelancer.toBase58(),
    status: "Proccessing",
    deadline
  });
  //   if(!apiResponse) {console.log('Do something')}

  console.log(apiResponse);
  // return tx;
}
