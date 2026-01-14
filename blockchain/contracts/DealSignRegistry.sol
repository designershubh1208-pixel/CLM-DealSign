// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract DealSignRegistry is Ownable {
    struct ContractRecord {
        bytes32 documentHash;
        address registeredBy;
        uint256 timestamp;
        string contractId; // Internal ID from backend
        bool exists;
    }

    struct ApprovalRecord {
        address approver;
        string role;
        uint256 timestamp;
        string comment;
    }

    // Mapping from document hash to Contract Record
    mapping(bytes32 => ContractRecord) public contracts;

    // Mapping from document hash to list of Approvals
    mapping(bytes32 => ApprovalRecord[]) public approvals;

    // Mapping from document hash to audit log entries (simplified strings)
    mapping(bytes32 => string[]) public auditLogs;

    // Events
    event ContractRegistered(bytes32 indexed documentHash, address indexed registeredBy, uint256 timestamp, string contractId);
    event ApprovalLogged(bytes32 indexed documentHash, address indexed approver, string role, uint256 timestamp);

    constructor() Ownable(msg.sender) {}

    /**
     * @dev Register a new contract hash
     * @param documentHash Hash of the contract document
     * @param contractId Internal ID of the contract
     */
    function registerContract(bytes32 documentHash, string memory contractId) external {
        require(!contracts[documentHash].exists, "Contract already registered");

        contracts[documentHash] = ContractRecord({
            documentHash: documentHash,
            registeredBy: msg.sender,
            timestamp: block.timestamp,
            contractId: contractId,
            exists: true
        });

        _addToAuditLog(documentHash, "Contract registered");

        emit ContractRegistered(documentHash, msg.sender, block.timestamp, contractId);
    }

    /**
     * @dev Log an approval for a registered contract
     * @param documentHash Hash of the contract
     * @param role Role of the approver
     * @param comment Optional comment
     */
    function logApproval(bytes32 documentHash, string memory role, string memory comment) external {
        require(contracts[documentHash].exists, "Contract not found");

        ApprovalRecord memory newApproval = ApprovalRecord({
            approver: msg.sender,
            role: role,
            timestamp: block.timestamp,
            comment: comment
        });

        approvals[documentHash].push(newApproval);
        
        string memory auditEntry = string(abi.encodePacked("Approved by ", role));
        _addToAuditLog(documentHash, auditEntry);

        emit ApprovalLogged(documentHash, msg.sender, role, block.timestamp);
    }

    /**
     * @dev Verify if a document hash exists on chain
     * @param documentHash Hash to check
     */
    function verifyDocument(bytes32 documentHash) external view returns (bool exists, address registeredBy, uint256 timestamp) {
        ContractRecord memory record = contracts[documentHash];
        return (record.exists, record.registeredBy, record.timestamp);
    }

    /**
     * @dev Get all approvals for a specific document
     * @param documentHash Hash of the contract
     */
    function getApprovals(bytes32 documentHash) external view returns (ApprovalRecord[] memory) {
        return approvals[documentHash];
    }

    /**
     * @dev Get simple audit log strings
     * @param documentHash Hash of the contract
     */
    function getAuditLog(bytes32 documentHash) external view returns (string[] memory) {
        return auditLogs[documentHash];
    }

    // Internal helper to append to log
    function _addToAuditLog(bytes32 documentHash, string memory action) internal {
        auditLogs[documentHash].push(action);
    }
}
