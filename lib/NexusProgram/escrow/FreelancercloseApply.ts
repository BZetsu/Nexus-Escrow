import { AnchorProvider, BN, Program, web3 } from '@project-serum/anchor';
import { NEXUSESCROW_V1, USER_PREFIX } from '../../constants/constants';
import { backendApi } from '@/lib/utils/api.util';
const idl = require('../../../data/nexus.json');

export async function closeApply(
  anchorWallet: any,
  connection: web3.Connection,
  wallet: any,
  escrow: web3.PublicKey
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

  console.log(escrow.toBase58());

  const tx = await program.methods
    .closeApply()
    .accounts({
      escrow: escrow,
      apply: apply,
      freelancer: freelancer,
      authority: anchorWallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .transaction();

  await wallet.sendTransaction(tx, connection, {
    preflightCommitment: 'confirmed',
  });

  const apiResponse = await backendApi.delete(`/freelancer/delete/${apply.toBase58()}`);
  //   if(!apiResponse) {console.log('Do something')}
  console.log(apiResponse);
  return tx;
}
