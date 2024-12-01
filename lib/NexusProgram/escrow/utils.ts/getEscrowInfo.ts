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
        
        if (account) {
            console.log("Raw Escrow Account Data:", {
                founder: account.founder.toBase58(),
                escrowAddress: escrow.toBase58(),
                status: account.status,
                contractName: account.contractName,
                fullAccount: account
            });
        } else {
            console.log("No escrow account found for address:", escrow.toBase58());
        }
        
        return account;
    } catch (e: any) {
        console.error("Error in getEscrowInfo:", e);
        console.error("Error stack:", e.stack);
        throw e;
    }
}