import fs from "fs";
import path from "path";
import prettier from "prettier";

const DEPLOYMENTS_DIR = path.resolve("./packages/hardhat/deployments");
const OUTPUT_DIR = path.resolve("./packages/fhevm-shared/src/contracts/");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "deployedContracts.ts");

function getDirectories(dir: string) {
  return fs.readdirSync(dir).filter(file => fs.statSync(path.join(dir, file)).isDirectory());
}

function getJsonFiles(dir: string) {
  return fs.readdirSync(dir).filter(file => file.endsWith(".json"));
}

function loadDeployments() {
  const output: Record<string, any> = {};
  if (!fs.existsSync(DEPLOYMENTS_DIR)) {
    throw new Error("No deployments directory found.");
  }

  for (const chain of getDirectories(DEPLOYMENTS_DIR)) {
    const chainDir = path.join(DEPLOYMENTS_DIR, chain);
    const chainIdPath = path.join(chainDir, ".chainId");
    if (!fs.existsSync(chainIdPath)) continue;

    const chainId = fs.readFileSync(chainIdPath, "utf8").trim();
    output[chainId] = {};

    for (const file of getJsonFiles(chainDir)) {
      const contractPath = path.join(chainDir, file);
      const contractData = JSON.parse(fs.readFileSync(contractPath, "utf8"));

      output[chainId][path.basename(file, ".json")] = {
        address: contractData.address,
        abi: contractData.abi,
      };
    }
  }

  return output;
}

async function generateContractsFile() {
  const contracts = loadDeployments();

  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const content = `
/**
 * Auto-generated file.
 * Contains deployed contracts with address and ABI.
 */
export const deployedContracts = ${JSON.stringify(contracts, null, 2)} as const;
`;

  const formatted = await prettier.format(content, { parser: "typescript" });
  fs.writeFileSync(OUTPUT_FILE, formatted);

  console.log(`✅ Contracts written to ${OUTPUT_FILE}`);
}

generateContractsFile().catch(console.error);
