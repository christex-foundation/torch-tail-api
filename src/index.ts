import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { createAirdrop, initAirship, sendAirdrop } from './airship';
import { Keypair, PublicKey } from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

const app = new Hono();

app.get('/', (c) => {
  return c.text('Hello OG2P!');
});

/**
 * POST /airship/create
 * Create and send an airdrop
 * @returns
 */
app.post('/airship/create', async (c) => {
  let { addresses, amount, mintAddress } = await c.req.json();

  const signer = Keypair.fromSecretKey(Uint8Array.from(JSON.parse(c.env.KEYPAIR)));
  addresses = (addresses as string[]).map((address) => new PublicKey(address));
  mintAddress = new PublicKey(mintAddress);

  await initAirship();
  await createAirdrop(signer.publicKey, addresses, amount, mintAddress);
  await sendAirdrop(signer, `${c.env.HELIUS_URL}?api-key=${process.env.HELIUS_API_KEY}`);
  return c.text('Airdrop initialized');
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
