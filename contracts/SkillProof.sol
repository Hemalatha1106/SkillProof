// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title SkillProof
 * @dev Store tamper-proof verification records for skills and internships.
 */
contract SkillProof {
    
    struct ProofRecord {
        string studentIdHash;
        string taskId;
        string ipfsHash;
        address mentor;
        uint256 timestamp;
    }

    // Mapping of Submission ID (or some unique string) to ProofRecord
    mapping(string => ProofRecord) public proofs;

    event ProofCreated(
        string indexed submissionId,
        string studentIdHash,
        string taskId,
        string ipfsHash,
        address indexed mentor,
        uint256 timestamp
    );

    /**
     * @dev Create a new verified proof of work.
     * @param _submissionId Unique ID from the Web2 database
     * @param _studentIdHash Hashed ID of the student
     * @param _taskId The task ID the student completed
     * @param _ipfsHash The IPFS CID of the submission file(s)
     */
    function createProof(
        string memory _submissionId,
        string memory _studentIdHash,
        string memory _taskId,
        string memory _ipfsHash
    ) external {
        require(bytes(_submissionId).length > 0, "Submission ID is required");
        require(bytes(proofs[_submissionId].studentIdHash).length == 0, "Proof already exists");

        uint256 currentTimestamp = block.timestamp;

        proofs[_submissionId] = ProofRecord({
            studentIdHash: _studentIdHash,
            taskId: _taskId,
            ipfsHash: _ipfsHash,
            mentor: msg.sender,
            timestamp: currentTimestamp
        });

        emit ProofCreated(
            _submissionId,
            _studentIdHash,
            _taskId,
            _ipfsHash,
            msg.sender,
            currentTimestamp
        );
    }

    /**
     * @dev Get proof verification details.
     * @param _submissionId Unique ID from the database
     */
    function getProof(string memory _submissionId) external view returns (ProofRecord memory) {
        return proofs[_submissionId];
    }
}
