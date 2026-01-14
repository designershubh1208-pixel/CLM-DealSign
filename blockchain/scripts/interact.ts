import { ethers } from "hardhat";

async function main() {
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
        throw new Error("CONTRACT_ADDRESS env variable not set");
    }

    // Define interface if not compiling locally, or better use getContractAt if artifact exists
    // const DealSignRegistry = await ethers.getContractFactory("DealSignRegistry");
    // const registry = DealSignRegistry.attach(contractAddress);

    // For interaction script without local artifacts, one might use vanilla ethers, but assuming hardhat env:
    const registry = await ethers.getContractAt("DealSignRegistry", contractAddress);

    // 1. Register a document
    const docHash = ethers.id("Document Content " + Date.now());
    const contractId = "contract_" + Math.floor(Math.random() * 1000);

    console.log(`Registering contract with hash: ${docHash}`);
    try {
        const tx = await registry.registerContract(docHash, contractId);
        console.log(`Transaction sent: ${tx.hash}`);
        await tx.wait();
        console.log("Contract registered!");
    } catch (e) {
        console.error("Registration failed:", e);
    }

    // 2. Log approval
    console.log("Logging approval...");
    try {
        const tx2 = await registry.logApproval(docHash, "LEGAL", "Approved by Legal Team");
        console.log(`Approval transaction: ${tx2.hash}`);
        await tx2.wait();
        console.log("Approval logged!");
    } catch (e) {
        console.error("Approval failed:", e);
    }

    // 3. Verify
    const verification = await registry.verifyDocument(docHash);
    console.log("Verification result:", verification);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
