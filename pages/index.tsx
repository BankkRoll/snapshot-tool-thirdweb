import { ChangeEvent, FC, useState } from 'react';
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import styles from '../styles/Home.module.css';
import exampleAbi from '../components/exampleABI';
import { toast } from 'react-hot-toast';

export default function Home() {
  const [contractAddress, setContractAddress] = useState<string>('');
  const [isThirdWeb, setIsThirdWeb] = useState<boolean>(true);
  const [abi, setAbi] = useState(JSON.stringify(exampleAbi, null, 2));
  const [nfts, setNfts] = useState<{ [address: string]: number }>({});
  const [csvData, setCsvData] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    setContractAddress(event.target.value);
  };

  const handleContractTypeChange = (event: ChangeEvent<HTMLInputElement>) => {
    setIsThirdWeb(event.target.value === 'thirdweb');
  };

  const handleAbiChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setAbi(event.target.value);
  };

  const handleFetchNFTs = async () => {
    if (!contractAddress) {
      toast.error('Please enter a contract address');
      return;
    }
    toast.loading('Fetching NFT Contract...');
    const sdk = new ThirdwebSDK("goerli");
    const contract = isThirdWeb
      ? await sdk.getContract(contractAddress)
      : await sdk.getContract(contractAddress, JSON.parse(abi));

    if (!contract) {
      toast.error('Contract not found');
      return;
    }

    const fetchedNfts = await contract?.erc721.getAll();

    if (!fetchedNfts) {
      toast.success('No NFTs found');
      return console.log("No NFTs found");
    }

    const csv = fetchedNfts?.reduce((acc: { [x: string]: number; }, nft: { owner: string; }) => {
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

    setNfts(filteredCsv);
    setCsvData(csvString);
    toast.remove();
    toast.success('NFTs fetched successfully');
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
    <div className={styles.container}>
      <h1 className={styles.title}>NFT Collection Snapshot Tool</h1>
       <span className={styles.subtitle}>ERC-721 Ethereum Mainnet</span>

      <input
        type="text"
        value={contractAddress}
        onChange={handleAddressChange}
        placeholder="Contract address"
        className={styles.input}
        required
      />

      <div className={styles.radioWrapper}>
        <div className={styles.radioGroup}>
          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="thirdweb"
              checked={isThirdWeb}
              onChange={handleContractTypeChange}
              className={styles.radio}
            />
            ThirdWeb Contract
          </label>

          <label className={styles.radioLabel}>
            <input
              type="radio"
              value="other"
              checked={!isThirdWeb}
              onChange={handleContractTypeChange}
              className={styles.radio}
            />
            Non ThirdWeb Contract
          </label>
        </div>
      </div>


      {!isThirdWeb && (
        <>
        <label className={styles.radioLabel}>
          Example ABI (Please update with your ABI)
        </label>
        <textarea
          value={abi}
          onChange={handleAbiChange}
          className={`${styles.textarea}`}
        />
        </>
      )}

      <button onClick={handleFetchNFTs} className={styles.button} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch NFTs'}
      </button>

      {csvData && (
        <>
          <h2 className={styles.nftTitle}>Address & Balances:</h2>

          <textarea readOnly value={csvData} className={`${styles.textarea}`} />

          <div className={styles.buttonContainer}>
            <button onClick={handleDownloadCSV} className={styles.button}>
              Download CSV
            </button>
            <button onClick={handleDownloadJSON} className={styles.button}>
              Download JSON
            </button>
          </div>
        </>
      )}
    </div>
  );
}
