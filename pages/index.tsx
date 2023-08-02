// index.tsx
import { ChangeEvent, FC, useState } from 'react';
import styles from '../styles/Home.module.css';
import exampleAbi from '../components/exampleABI';
import { toast } from 'react-hot-toast';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

// Define a type for the NFTs
interface NFT {
  owner: string;
}

export default function Home() {
  const [contractAddress, setContractAddress] = useState<string>('');
  const [isThirdWeb, setIsThirdWeb] = useState<boolean>(true);
  const [abi, setAbi] = useState(JSON.stringify(exampleAbi, null, 2));
  const [nfts, setNfts] = useState<{ [address: string]: number }>({});
  const [csvData, setCsvData] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [network, setNetwork] = useState<string>('ethereum');

  // Input handling functions
  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => setContractAddress(event.target.value);
  const handleContractTypeChange = (event: ChangeEvent<HTMLInputElement>) => setIsThirdWeb(event.target.value === 'thirdweb');
  const handleAbiChange = (event: ChangeEvent<HTMLTextAreaElement>) => setAbi(event.target.value);
  const handleNetworkChange = (event: ChangeEvent<HTMLSelectElement>) => setNetwork(event.target.value);

  const fetchChunkWithRetry = async (contract: any, start: number, chunkSize: number, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        return await contract.erc721.getAll({ count: chunkSize, start });
      } catch (err) {
        if (i === retries - 1) throw err;
      }
    }
  };

  const fetchNFTs = async () => {
    if (!contractAddress) {
      throw new Error('Contract address is required. Please provide a valid address.');
    }

    // Check for the environment variable
    if (!process.env.NEXT_PUBLIC_CLIENT_ID) {
      throw new Error('Missing NEXT_PUBLIC_CLIENT_ID environment variable.');
    }
      
    const sdk = new ThirdwebSDK(network, { clientId: process.env.NEXT_PUBLIC_CLIENT_ID });
    const contract = await sdk.getContract(contractAddress);

    if (!contract) {
      throw new Error('Unable to find the specified contract. Please verify the contract address.');
    }

    const totalCount = await contract.erc721.totalCount();
    const totalCountNumber = totalCount.toNumber();

    let fetchedNfts: NFT[] = [];
    const chunkSize = 2500;
    for(let i = 0; i < totalCountNumber; i += chunkSize) {
      const chunk = await fetchChunkWithRetry(contract, i, chunkSize);
      fetchedNfts = [...fetchedNfts, ...chunk];
    }

    if (!fetchedNfts || fetchedNfts.length === 0) {
      throw new Error('No NFTs found for the given contract.');
    }

    const csv = fetchedNfts.reduce((acc: { [x: string]: number; }, nft: NFT) => {
      const address = nft.owner;
      const quantity = acc[address] ? acc[address] + 1 : 1;
      return { ...acc, [address]: quantity };
    }, {});

    const filteredCsv = Object.keys(csv).filter(key => key !== "0x0000000000000000000000000000000000000000").reduce((acc, key) => {
      return {
        ...acc,
        [key]: csv[key],
      };
    }, {});

    const csvString =
      "address,quantity\r" +
      Object.entries(filteredCsv)
        .map(([address, quantity]) => `${address},${quantity}`)
        .join("\r");

    setNfts(filteredCsv);
    setCsvData(csvString);
  };

  const handleFetchNFTs = () => {
    setLoading(true);
    toast.promise(
      fetchNFTs(),
      {
        loading: 'Fetching NFTs...',
        success: 'Successfully fetched NFTs. You can now download the results.',
        error: (err) => `An error occurred while fetching NFTs: ${err.message}`,
      },
      {
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
      }
    ).finally(() => setLoading(false));
  };

  const handleDownloadCSV = () => {
    const element = document.createElement('a');
    const file = new Blob([csvData], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'nfts.csv';
    document.body.appendChild(element);
    element.click();
  };

  const handleDownloadJSON = () => {
    const json = Object.entries(nfts).map(([address, quantity]) => ({ address, quantity }));
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(json)], { type: 'application/json' });
    element.href = URL.createObjectURL(file);
    element.download = 'nfts.json';
    document.body.appendChild(element);
    element.click();
  };

  return (
    <div className="flex flex-col h-screen bg-gray-800">
    <div className="px-4 py-3 bg-gray-900 shadow">
      <h1 className="text-lg font-semibold text-white">NFT Collection Snapshot Tool</h1>
      
      <div className="mt-2">
        <input
          type="text"
          value={contractAddress}
          onChange={handleAddressChange}
          id="contract-address"
          placeholder="Contract address"
          className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white sm:text-sm"
          required
        />
      </div>
    </div>
  
    <div className="flex-col md:flex-row flex-grow flex bg-gray-800">
      <div className="w-full md:w-64 p-4 bg-gray-900">
          <div className="mb-4">
            <div className="mb-6">
              <span className="text-sm text-white">ERC-721 - </span>
              <select value={network} onChange={handleNetworkChange} className="mt-1 block w-full py-2 px-3 border border-gray-600 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white sm:text-sm">
                <option value="ethereum">Ethereum Mainnet</option>
                <option value="ropsten">Ethereum Ropsten Testnet</option>
                <option value="rinkeby">Ethereum Rinkeby Testnet</option>
                <option value="goerli">Ethereum Goerli Testnet</option>
                <option value="kovan">Ethereum Kovan Testnet</option>
                <option value="polygon">Polygon Mainnet</option>
                <option value="mumbai">Polygon Mumbai Testnet</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="radio"
                value="thirdweb"
                checked={isThirdWeb}
                onChange={handleContractTypeChange}
                id="thirdweb"
                className="text-blue-500"
              />
              <label htmlFor="thirdweb" className="ml-2 text-sm text-white">ThirdWeb Contract</label>
            </div>
            <div className="flex items-center mt-2">
              <input
                type="radio"
                value="other"
                checked={!isThirdWeb}
                onChange={handleContractTypeChange}
                id="other"
                className="text-blue-500"
              />
              <label htmlFor="other" className="ml-2 text-sm text-white">Non ThirdWeb Contract</label>
            </div>
          </div>
          
          {!isThirdWeb && (
            <div className="mb-4">
              <label htmlFor="abi" className="block text-sm font-medium text-white">Example ABI (Please update with your ABI)</label>
              <textarea
                value={abi}
                onChange={handleAbiChange}
                id="abi"
                className="mt-1 block w-full h-96 py-2 px-3 border border-gray-600 bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-white sm:text-sm"
              />
            </div>
          )}
  
          <button onClick={handleFetchNFTs} className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" disabled={loading}>
            {loading ? 'Loading...' : 'Fetch NFTs'}
          </button>
        </div>
  
        <div className="flex-grow p-4 bg-gray-750 rounded-tl-3xl md:rounded-bl-3xl">
          <h2 className="mb-4 text-2xl font-semibold text-white">Address & Balances:</h2>
          <div className="mb-6 bg-gray-700 p-2 rounded-md shadow">
            <textarea readOnly value={csvData || ""} className="w-full h-96 bg-transparent text-white border-none focus:ring-0 focus:outline-none resize-none" />
          </div>
          <div className="flex space-x-4">
            <button 
              onClick={handleDownloadCSV} 
              className={`flex-grow py-2 px-4 border border-transparent rounded-md shadow text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                csvData ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-600 cursor-not-allowed'
              }`}
              disabled={!csvData}
            >
              Download CSV
            </button>
            <button 
              onClick={handleDownloadJSON} 
              className={`flex-grow py-2 px-4 border border-transparent rounded-md shadow text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                csvData ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' : 'bg-gray-600 cursor-not-allowed'
              }`}
              disabled={!csvData}
            >
              Download JSON
            </button>
          </div>
        </div>
      </div>
      <footer className="p-4 bg-gray-900 flex items-center justify-center space-x-4">
      <a href="https://thirdweb.com/" target="_blank" rel="noopener noreferrer">
        <img
          src="/thirdweb.svg"
          alt="Thirdweb Logo"
          width={60}
          className="transition-opacity hover:opacity-75"
        />
      </a>
      <p className="text-center text-sm text-white">
        Made with 🧠 by{" "}
        <a
          href="https://twitter.com/bankkroll"
          className="text-blue-500 hover:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          bankkroll
        </a>
      </p>
    </footer>
    </div>
  );
}