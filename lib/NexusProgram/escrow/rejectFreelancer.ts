import {
    AnchorProvider,
    BN,
    Program, web3
} from '@project-serum/anchor';
import { NEXUSESCROW_V1, USER_PREFIX } from "../../constants/constants";
const idl = require("../../../data/nexus.json")

export async function rejectFreelancer(
    anchorWallet: any,
    connection: web3.Connection,
    wallet: any,
    escrow: web3.PublicKey,
    apply: web3.PublicKey,
) {

    const provider = new AnchorProvider(
        connection, anchorWallet, { "preflightCommitment": "processed" },
    );

    const PROGRAM_ID = new web3.PublicKey(idl.metadata.address)
    const program = new Program(idl, idl.metadata.address, provider);

    const [reciever] = web3.PublicKey.findProgramAddressSync(
        [
            anchorWallet.publicKey.toBuffer(),
            Buffer.from(USER_PREFIX),
        ],
        PROGRAM_ID
    );

    const [nexusEscrow] = web3.PublicKey.findProgramAddressSync(
        [
            Buffer.from(NEXUSESCROW_V1)
        ],
        PROGRAM_ID
    );

    console.log(escrow.toBase58())

    const tx = await program.methods.reject().accounts({
        escrow: escrow,
        apply: apply,
        authority: anchorWallet.publicKey,
        systemProgram: web3.SystemProgram.programId
    })
        .transaction()
    // .rpc({
    //     commitment: "confirmed",
    // })
    const blockhash = (await connection.getLatestBlockhash()).blockhash
    tx.recentBlockhash = blockhash;
    tx.feePayer = anchorWallet.publicKey;



    await wallet.sendTransaction(tx, connection, {
        preflightCommitment: "confirmed"
    })


    return tx;
}