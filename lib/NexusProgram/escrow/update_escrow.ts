import { AnchorProvider, BN, Program, web3 } from '@project-serum/anchor';
import { NEXUSESCROW_V1, USER_PREFIX } from '../../constants/constants';
import { backendApi } from '@/lib/utils/api.util';
const idl = require('../../../data/nexus.json');

/**
    deadline: i64,
 */

export async function updateEscrow(
  anchorWallet: any,
  connection: web3.Connection,
  escrow: web3.PublicKey,
  deadline: number,
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

  const [nexusEscrow] = web3.PublicKey.findProgramAddressSync(
    [Buffer.from(NEXUSESCROW_V1)],
    PROGRAM_ID
  );

  console.log(escrow.toBase58());

  const tx = await program.methods
    .updateEscrow({
      deadline: new BN(deadline),
    })
    .accounts({
      escrow: escrow,
      founder: founder,
      authority: anchorWallet.publicKey,
      systemProgram: web3.SystemProgram.programId,
    })
    .transaction();
  // .rpc({
  //     commitment: "confirmed",
  // })

  await wallet.sendTransaction(tx, connection, {
    preflightCommitment: 'confirmed',
  });

  const apiResponse = await backendApi.patch(
    `/escrow/update/${escrow.toBase58()}`,
    {
      deadline,
      //   telegramLink,
      //   private
    }
  );
  //   if(!apiResponse) {console.log('Do something')}
  console.log(apiResponse);
  return tx;
}
