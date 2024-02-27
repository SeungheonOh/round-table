import type { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from 'redis';
import kv from '@vercel/kv';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const {transaction, pkh} = req.query

  let client;
  if(process.env.REDIS_SOURCE == 'vercel') {
    client = kv;
  } else {
    client = await createClient({url: process.env.REDIS_SOURCE})
      .on('error', err => console.log('Redis Client Error', err))
      .connect();
  }

  if(req.method === 'GET') {
    const signature = await client.get(transaction+":"+pkh);
    res.status(200).json({signature: signature})
  } else if(req.method === 'POST') {
    const {vkeywitness} = JSON.parse(req.body);
    await client.set(transaction+":"+pkh, vkeywitness);
    res.status(200).json({})
  }
}
