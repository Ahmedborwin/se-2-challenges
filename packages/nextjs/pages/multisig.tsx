import { type FC } from "react";
import { ChangeEvent, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import * as chains from "wagmi/chains";
import { TransactionEventItem } from "~~/components/TransactionEventItem";
import { Address, Balance } from "~~/components/scaffold-eth";
import { useDeployedContractInfo, useScaffoldEventHistory } from "~~/hooks/scaffold-eth";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

export const SERVER_URL =
  getTargetNetwork().id === chains.hardhat.id ? "http://localhost:49832/" : "https://backend.multisig.holdings:49832/";

const Multisig: FC = () => {
  const [addressArray, setAddressArray] = useState<string[]>([]);
  const [currentAddress, setCurrentAddress] = useState<string>("");
  const [signatureRequired, setSignatureRequired] = useState<number | "">("");

  const { data: contractInfo } = useDeployedContractInfo("MetaMultiSigWallet");

  const contractAddress = contractInfo?.address;

  const { data: executeTransactionEvents } = useScaffoldEventHistory({
    contractName: "MetaMultiSigWallet",
    eventName: "ExecuteTransaction",
    fromBlock: 0n,
  });

  const handleCurrentAddressChange = async (e: ChangeEvent<HTMLInputElement>) => {
    setCurrentAddress(e.target.value);
  };

  //set address array
  const addAddress = () => {
    if (currentAddress) {
      setAddressArray(prevAddresses => [...prevAddresses, currentAddress]);
      setCurrentAddress("");
    }
  };
  const handleSignatureRequiredChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const sigReq = e.target.value;
    setSignatureRequired(sigReq === "" ? "" : parseInt(sigReq));
  };

  const handleDeploy = async () => {
    try {
      const response = await fetch(`${SERVER_URL}deploy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Adjust the body as per your deployment data requirements
        body: JSON.stringify({
          Addresses: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", "0x70997970C51812dc3A010C7d01b50e0d17dc79C8"],
          Sig_Required: 2,
        }),
      });

      if (response.ok) {
        // Handle successful deployment
        console.log("Deployment initiated successfully");
        // Any post-deployment logic
      } else {
        // Handle server response error (e.g., non-2xx status code)
        console.error("Deployment failed with status: ", response.status);
      }
    } catch (e) {
      // Handle fetch errors (e.g., network issues)
      console.error("Error while initiating deployment", e);
    }
  };

  return (
    <div className="flex items-center flex-col flex-grow w-full font-bold">
            <div className="flex flex-col gap-4 items-center bg-base-100 shadow-lg shadow-secondary border-8 border-secondary rounded-xl p-6 w-full max-w-lg">
      <h2 className="font-xlbold"> Create MultSig Wallet</h2>
      <form onSubmit={handleDeploy} >
        <div>
          <label htmlFor="currentAddress"></label>
          <input type="text" id="currentAddress" placeholder="Owner Address" value={currentAddress} onChange={handleCurrentAddressChange} />
        </div>
        <div>
        <button className="border p-2 rounded-xl" type="button" onClick={addAddress}>
            Add Address
          </button>
        </div>
        <div className="flex flex-col gap-2 items-center justify-center bg-base-100 border-2 shadow-md rounded-xl min-w-full">
          <h4 className="mt-2">Owner Addresses Added</h4>
          <ul>
            {addressArray.map((address, index) => (
              <li key={index}>{address}</li>
            ))}
          </ul>
        </div>
        <div>
          <label htmlFor="signatureRequired"></label>
          <input
          className="text-black border-2 shadow-md rounded-xl p-4"
            type="integer"
            id="signatureRequired"
            placeholder="No of Sigs Required"
            value={signatureRequired}
            onChange={handleSignatureRequiredChange}
          />
        </div>
        <div className="text-lg font-bold">
        <button className="p-4 border-4 shadow-md rounded-xl" onClick={handleDeploy}>
          Deploy Multisig contract
        </button>
      </div>
      </form>
      </div >
      <div className="flex flex-col gap-4 items-center bg-base-100 shadow-lg shadow-secondary border-8 border-secondary rounded-xl p-6 w-full max-w-lg">
        <Balance address={contractAddress} />
        <QRCodeSVG value={contractAddress || ""} size={256} />
        <Address address={contractAddress} />
      </div>
      <div className="flex flex-col mt-10 items-center bg-base-100 shadow-lg shadow-secondary border-8 border-secondary rounded-xl p-6 w-full max-w-3xl">
        <div className="text-xl font-bold my-2">Events:</div>
        {executeTransactionEvents?.map(txEvent => (
          <TransactionEventItem key={txEvent.args.hash} {...txEvent.args} />
        ))}
      </div>
    </div>
  );
};

export default Multisig;
