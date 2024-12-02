import { AnchorProvider, BN, Program, web3 } from '@project-serum/anchor';
import { USER_PREFIX } from '../constants/constants';
import { backendApi } from '../utils/api.util';
const idl = require('../../data/nexus.json');

/**
    name: String,
    image: String,
    category: String,
    roles: String,
    level_of_expertise: String,
    payment_rate_per_hour: u64,
    profile_overview: String,
    links: String,
    nigotion: Boolean,
 */

export async function update_user(
  anchorWallet: any,
  connection: web3.Connection,
  name: string,
  image: string,
  category: string,
  roles: string,
  level_of_expertise: string,
  others: string,
  profile_overview: string,
  payment_rate_per_hour: number,
  nigotion: boolean,
  resume: string,
  portfolio: string,
  discord_id: string,
  telegram_id: string,
  website: string,
  linkedin: string,
  twitter: string,
  country: string,
  timezone: string,
  wallet: any
) {
  // twitter = twitter.replace('https://twitter.com/', '');
  // twitter = twitter.replace('/', '');
  // linkedin = linkedin.replace('https://www.linkedin.com/in/', '');
  // linkedin = linkedin.replace('/', '');

  const provider = new AnchorProvider(connection, anchorWallet, {
    preflightCommitment: 'processed',
  });

  const PROGRAM_ID = new web3.PublicKey(idl.metadata.address);
  const program = new Program(idl, idl.metadata.address, provider);

  const [user] = web3.PublicKey.findProgramAddressSync(
    [anchorWallet.publicKey.toBuffer(), Buffer.from(USER_PREFIX)],
    PROGRAM_ID
  );

  console.log(country)
  console.log(timezone)
  console.log(name)
  console.log(image)
  console.log(category)
  console.log(roles)
  console.log(level_of_expertise)
  console.log(payment_rate_per_hour)
  console.log(profile_overview)
  console.log(nigotion)
  console.log(others)
  console.log(twitter)
  console.log(linkedin)
  console.log(website)
  console.log(discord_id)
  console.log(resume)
  console.log(telegram_id)
  console.log(portfolio)

  // const tx = await program.methods
  //   .updateUser({
  //     name: name,
  //     image: image,
  //     category: category,
  //     roles: roles,
  //     levelOfExpertise: "level_of_expertise",
  //     paymentRatePerHour: new BN(Number(payment_rate_per_hour)),
  //     profileOverview: profile_overview,
  //     nigotion: nigotion,
  //     others: others,
  //     linkedin: linkedin,
  //     twitter: twitter,
  //     website: website,
  //     discordId: discord_id,
  //     telegramId: telegram_id,
  //     resume,
  //     portfolio,
  //   })
  //   .accounts({
  //     user: user,
  //     authority: anchorWallet.publicKey,
  //     systemProgram: web3.SystemProgram.programId,
  //   })
  //   .transaction();
  // // .rpc({
  // //     commitment: "confirmed",
  // // })

  // wallet.sendTransaction(tx, connection, {
  //   preflightCommitment: 'confirmed',
  // });
  console.log("twitter: " + twitter);
  const apiResponse = await backendApi.patch(`/nexus-user/${anchorWallet.publicKey.toBase58()}`, {
    name,
    image: image,
    category: category,
    roles: [roles],
    levelOfExpertise: level_of_expertise,
    paymentRatePerHour: payment_rate_per_hour.toString(),
    profileOverview: profile_overview,
    others: "others",
    negotiation: nigotion,
    portfolio: portfolio && portfolio.trim() !== '' ? portfolio : undefined,
    resume: resume && resume.trim() !== '' ? resume : undefined,
    // tosp,
    timeZone: timezone,
    country,
    address: anchorWallet.publicKey.toBase58(),
    twitter: twitter,
    linkedin: "https://www.youtube.com/",
    discordId: "https://www.youtube.com/",
    telegramId: "https://www.youtube.com/",
    website: "https://www.youtube.com/",
  })
  .then((e) => console.log(e))
  .catch((e) => {
    console.log(e)
    throw e;
  })
  ;

  console.log(apiResponse);
  //   if(!apiResponse) {console.log('Do something')}

  // return tx;
}
