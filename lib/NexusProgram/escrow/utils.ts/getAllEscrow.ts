import { IDL } from "@/data/IDL";
import { BorshAccountsCoder } from "@coral-xyz/anchor";

import type { Commitment, Connection } from "@solana/web3.js";
import { PublicKey } from "@solana/web3.js";

export const getAllEscrow = async (
    connection: Connection,
    commitment?: Commitment,
) => {
    try {
        const NEXUS_ADDRESS = new PublicKey("3GKGywaDKPQ6LKXgrEvBxLAdw6Tt8PvGibbBREKhYDfD");

        const ESCROW_SIZE = 424;
        const programAccounts = await connection.getProgramAccounts(
            NEXUS_ADDRESS,
            {
                filters: [{ dataSize: ESCROW_SIZE }],
                // filters: [{ memcmp: { offset: INVITATION_OFFSET, bytes: project.toBase58() } }],
                commitment,
            }
        );

        console.log(programAccounts.length)
        const InvitationDatas: any[] = [];
        const coder = new BorshAccountsCoder(IDL);
        programAccounts.forEach((account) => {
            try {
                const InvitationData: any = coder.decode(
                    "Escrow",
                    account.account.data
                );
                
                console.log("Raw escrow data from blockchain:", {
                    contractName: InvitationData.contractName,
                    private: InvitationData.private,
                    rawData: InvitationData
                });

                InvitationData.pubkey = account.pubkey;
                if (InvitationData) {
                    InvitationDatas.push(InvitationData);
                }
            } catch (e) {
                console.log(`Failed to decode token manager data`);
            }
        });
        return InvitationDatas;
    } catch (error) {
        console.error("Error in getAllEscrow:", error);
        throw error;
    }
};



