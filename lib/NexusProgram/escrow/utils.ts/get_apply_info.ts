import { AnchorProvider, Program, web3 } from '@project-serum/anchor';
import { USER_PREFIX } from "../../../constants/constants";
const idl = require("../../../../data/nexus.json")

export async function get_apply_info(
    anchorWallet: any,
    connection: web3.Connection,
    user: web3.PublicKey
) {
    try {
        const provider = new AnchorProvider(
            connection, anchorWallet, { "preflightCommitment": "processed" },
        );

        const program = new Program(idl, idl.metadata.address, provider);
        const account = await program.account.applyEscrow.fetchNullable(user);
        console.log("account");
        console.log(account);
        return account;
    } catch (e) {
        console.log(e);
    }
}