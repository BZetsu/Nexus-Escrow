import { AnchorProvider, Program, web3 } from '@project-serum/anchor';
const idl = require("../../../data/nexus.json")

export async function get_profile_info(
    anchorWallet: any,
    connection: web3.Connection,
    user: web3.PublicKey
) {
    try {
        const provider = new AnchorProvider(
            connection, anchorWallet, { "preflightCommitment": "processed" },
        );
        const program = new Program(idl, idl.metadata.address, provider);
        const account = await program.account.user.fetchNullable(user);
        console.log(account);
        return account;
    } catch (e) {
        console.log(e);
    }
}