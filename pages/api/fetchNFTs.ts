import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { contractAddress, network } = req.body;

  if (!contractAddress || !network) {
    res.status(400).json({ error: 'Please provide a contract address and network' });
    return;
  }

  try {
    const sdk = new ThirdwebSDK(network, { secretKey: process.env.SECRET_KEY });
    const contract = await sdk.getContract(contractAddress);

    if (!contract) {
      res.status(404).json({ error: 'Contract not found' });
      return;
    }

    const totalCount = await contract.erc721.totalCount();
    const totalCountNumber = totalCount.toNumber();

    let fetchedNfts: any[] = [];
    const chunkSize = 100;
    for(let i = 0; i < totalCountNumber; i += chunkSize) {
      const chunk = await contract.erc721.getAll({ count: chunkSize, start: i });
      fetchedNfts = [...fetchedNfts, ...chunk];
    }

    if (!fetchedNfts || fetchedNfts.length === 0) {
      res.status(200).json({ message: 'No NFTs found' });
      return;
    }

    const csv = fetchedNfts.reduce((acc: { [x: string]: number; }, nft: { owner: string; }) => {
      const address = nft.owner;
      const quantity = acc[address] ? acc[address] + 1 : 1;
      return { ...acc, [address]: quantity };
    }, {});

    const filteredCsv = Object.keys(csv).reduce((acc, key) => {
      if (key !== "0x0000000000000000000000000000000000000000") {
        return {
          ...acc,
          [key]: csv[key],
        };
      }
      return acc;
    }, {});

    const csvString =
      "address,quantity\r" +
      Object.entries(filteredCsv)
        .map(([address, quantity]) => `${address},${quantity}`)
        .join("\r");

    res.status(200).json({ csvData: csvString });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred while fetching NFTs' });
  }
}
