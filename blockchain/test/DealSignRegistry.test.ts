import { expect } from "chai";
import { ethers } from "hardhat";
import { DealSignRegistry } from "../typechain-types";

describe("DealSignRegistry", function () {
    let registry: DealSignRegistry;
    let owner: any;
    let user1: any;
    let user2: any;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        const DealSignRegistryFactory = await ethers.getContractFactory("DealSignRegistry");
        registry = (await DealSignRegistryFactory.deploy()) as unknown as DealSignRegistry;
    });

    describe("Registration", function () {
        it("Should register a new contract", async function () {
            const docHash = ethers.id("doc1");
            const contractId = "c1";

            await expect(registry.registerContract(docHash, contractId))
                .to.emit(registry, "ContractRegistered")
                .withArgs(docHash, owner.address, (await ethers.provider.getBlock("latest"))?.timestamp! + 1, contractId);

            const contract = await registry.contracts(docHash);
            expect(contract.exists).to.be.true;
            expect(contract.registeredBy).to.equal(owner.address);
            expect(contract.contractId).to.equal(contractId);
        });

        it("Should fail duplicate registration", async function () {
            const docHash = ethers.id("doc1");
            await registry.registerContract(docHash, "c1");

            await expect(
                registry.registerContract(docHash, "c2")
            ).to.be.revertedWith("Contract already registered");
        });
    });

    describe("Approvals", function () {
        const docHash = ethers.id("doc1");

        beforeEach(async function () {
            await registry.registerContract(docHash, "c1");
        });

        it("Should log an approval", async function () {
            await expect(registry.connect(user1).logApproval(docHash, "LEGAL", "Looks good"))
                .to.emit(registry, "ApprovalLogged")
                .withArgs(docHash, user1.address, "LEGAL", (await ethers.provider.getBlock("latest"))?.timestamp! + 1);

            const approvals = await registry.getApprovals(docHash);
            expect(approvals.length).to.equal(1);
            expect(approvals[0].approver).to.equal(user1.address);
            expect(approvals[0].role).to.equal("LEGAL");
            expect(approvals[0].comment).to.equal("Looks good");
        });

        it("Should fail approval for non-existent contract", async function () {
            const badHash = ethers.id("bad");
            await expect(
                registry.logApproval(badHash, "ROLE", "Comm")
            ).to.be.revertedWith("Contract not found");
        });
    });

    describe("Verification", function () {
        it("Should verify existing document", async function () {
            const docHash = ethers.id("doc1");
            await registry.registerContract(docHash, "c1");

            const res = await registry.verifyDocument(docHash);
            expect(res.exists).to.be.true;
            expect(res.registeredBy).to.equal(owner.address);
        });

        it("Should return false for non-existent document", async function () {
            const res = await registry.verifyDocument(ethers.id("none"));
            expect(res.exists).to.be.false;
        });
    });

    describe("Audit Log", function () {
        it("Should maintain audit log", async function () {
            const docHash = ethers.id("doc_audit");
            await registry.registerContract(docHash, "audit_test");
            await registry.logApproval(docHash, "ADMIN", "Approved");

            const log = await registry.getAuditLog(docHash);
            expect(log.length).to.equal(2);
            expect(log[0]).to.equal("Contract registered");
            expect(log[1]).to.equal("Approved by ADMIN");
        });
    });
});
