import { AnchorProvider, Program, web3 } from '@project-serum/anchor';
import { USER_PREFIX } from "../../../constants/constants";
const idl = require("../../../../data/nexus.json")

export async function get_userr_info(
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
        
        return {
            name: account?.name,
            image: account?.image,
            twitter: account?.twitter,
            telegramId: account?.telegramId,
            profileOverview: account?.profileOverview,
            levelOfExpertise: account?.levelOfExpertise,
            category: account?.category
        };
    } catch (e) {
        console.log(e);
    }
}