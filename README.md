# NFT Snapshot Tool

A simple tool for fetching NFT balances from a smart contract.

![screencapture-localhost-3000-2023-04-28-14_45_22](https://user-images.githubusercontent.com/106103625/235228591-d1fc15ba-0a33-4241-9ebc-8223399d477c.png)

## Note

Due to the long response times exceeding Vercel's serverless function timeout limits, this tool can no longer operate directly on Vercel. The tool's functionality remains intact and the "getAll" operation is still functional when executed locally. 


## Usage

1. Download the repository.
2. Rename the .env.example file to .env or .env.local and fill in any necessary information.
3. Install dependencies: `npm install`.
4. Start the app locally: `npm run dev` or `npm start`.
5. Once the application is running, enter the contract address in the input field.
6. Select the contract type. If the contract is a ThirdWeb contract, leave the default "ThirdWeb Contract" selected. If it is a non-ThirdWeb contract, select "Non ThirdWeb Contract" and enter the ABI in the textarea.
7. Click the "Fetch NFTs" button.
8. Once the NFT balances have been fetched, they will be displayed in the textarea.
9. Click the "Download CSV" button to download the NFT balances as a CSV file.
10. Click the "Download JSON" button to download the NFT balances as a JSON file.

## Learn More

To learn more about ThirdWeb, check out the [ThirdWeb documentation](https://portal.thirdweb.com/).

To learn more about Next, check out the [Next documentation](https://nextjs.org/).
