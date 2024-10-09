import * as airdropsender from 'helius-airship-core';

import { drizzle } from 'drizzle-orm/sqlite-proxy';
import { SQLocalDrizzle } from 'sqlocal/drizzle';
import { Keypair, PublicKey } from '@solana/web3.js';
import { BrowserDatabase, databaseFile } from 'helius-airship-core';
import { sql } from 'drizzle-orm';

/**
 * Initialize SQLocalDrizzle
 */
const { driver, batchDriver } = new SQLocalDrizzle({
  databasePath: databaseFile,
  verbose: false,
});

const db = drizzle(driver, batchDriver);

/**
 * Initialize the Airship database
 */
export async function initAirship() {
  await configureDatabase(db);
  await airdropsender.init({ db });
}

/**
 * Create an airdrop
 */
export async function createAirdrop(
  signer: PublicKey,
  addresses: PublicKey[],
  amount: bigint,
  mintAddress: PublicKey,
) {
  await configureDatabase(db);
  await airdropsender.create({
    db,
    signer,
    addresses,
    amount,
    mintAddress,
  });
}

/**
 * Send an airdrop
 */
export async function sendAirdrop(keypair: Keypair, url: string) {
  await configureDatabase(db);
  await airdropsender.send({
    keypair,
    url,
    db,
  });
}

/**
 * Get the status of an airdrop
 */
export async function getAirdropStatus() {
  await configureDatabase(db);
  return await airdropsender.status({ db });
}

/**
 * Configure the database
 */
async function configureDatabase(db: BrowserDatabase): Promise<void> {
  await db.run(sql`PRAGMA journal_mode = WAL;`);
  await db.run(sql`PRAGMA synchronous = normal;`);
}
