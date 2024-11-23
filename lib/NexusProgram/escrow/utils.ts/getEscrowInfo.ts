import { AnchorProvider, Program, web3 } from '@project-serum/anchor';
import { USER_PREFIX } from "../../../constants/constants";
const idl = require("../../../../data/nexus.json")

export async function getEscrowInfo(
    anchorWallet: any,
    connection: web3.Connection,
    escrow: web3.PublicKey
) {
    try {
        const provider = new AnchorProvider(
            connection, anchorWallet, { "preflightCommitment": "processed" },
        );

        const program = new Program(idl, idl.metadata.address, provider);
        const account = await program.account.escrow.fetchNullable(escrow);
        console.log(account);
        console.log("account");
        return account;
    } catch (e) {
        console.log(e);
    }
}