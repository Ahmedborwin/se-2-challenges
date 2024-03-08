import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a "MetaMultiSigWallet" contract
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployMetaMultiSigWallet: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {


  const addresses = process.env.ADDRESSES.split(",");
  const signaturesRequired = parseInt(process.env.SIGNATURES_REQUIRED, 10);

  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  console.log("@@deploy script addresses", addresses)
  console.log("@@deploy script signaturesRequired", signaturesRequired)
  await deploy("MetaMultiSigWallet", {
    from: deployer,
    // Contract constructor arguments
    args: [31337, addresses, signaturesRequired],
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  // Get the deployed contract
  const metaMultiSigWallet = await hre.ethers.getContract("MetaMultiSigWallet", deployer);
  console.log(`New deployed Multisig at: ${metaMultiSigWallet}`)
};

export default deployMetaMultiSigWallet;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags MetaMultiSigWallet
deployMetaMultiSigWallet.tags = ["MetaMultiSigWallet"];
