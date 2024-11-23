import { AnchorProvider, Program, web3 } from '@project-serum/anchor';
import { USER_PREFIX } from "../../constants/constants";
const idl = require("../../../data/nexus.json")

export async function get_userr_info(
    anchorWallet: any,
    connection: web3.Connection,
    _user: string
) {
    try {
        const provider = new AnchorProvider(
            connection, anchorWallet, { "preflightCommitment": "processed" },
        );
        const PROGRAM_ID = new web3.PublicKey(idl.metadata.address)

        const [user] = web3.PublicKey.findProgramAddressSync(
            [
                (new web3.PublicKey(_user)).toBuffer(),
                Buffer.from(USER_PREFIX),
            ],
            PROGRAM_ID
        );

        const program = new Program(idl, idl.metadata.address, provider);
        const account = await program.account.user.fetchNullable(user);
        console.log(account);
        console.log("account");
        return account;
    } catch (e) {
        console.log(e);
    }
}