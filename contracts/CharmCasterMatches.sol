// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title CharmCasterMatches
 * @dev Simple contract to record matches between Farcaster users on Celo
 */
contract CharmCasterMatches {
    event MatchRecorded(uint256 indexed fid1, uint256 indexed fid2, uint256 timestamp);
    
    struct Match {
        uint256 fid1;
        uint256 fid2;
        uint256 timestamp;
        bool exists;
    }
    
    // Mapping from match ID to Match struct
    mapping(bytes32 => Match) public matches;
    
    // Mapping to track user's matches
    mapping(uint256 => bytes32[]) public userMatches;
    
    // Total number of matches recorded
    uint256 public totalMatches;
    
    /**
     * @dev Record a new match between two users
     * @param fid1 First user's Farcaster ID
     * @param fid2 Second user's Farcaster ID
     */
    function recordMatch(uint256 fid1, uint256 fid2) external {
        require(fid1 != fid2, "Cannot match with yourself");
        require(fid1 > 0 && fid2 > 0, "Invalid FID");
        
        // Ensure consistent ordering (smaller FID first)
        if (fid1 > fid2) {
            (fid1, fid2) = (fid2, fid1);
        }
        
        bytes32 matchId = keccak256(abi.encodePacked(fid1, fid2));
        require(!matches[matchId].exists, "Match already exists");
        
        matches[matchId] = Match({
            fid1: fid1,
            fid2: fid2,
            timestamp: block.timestamp,
            exists: true
        });
        
        userMatches[fid1].push(matchId);
        userMatches[fid2].push(matchId);
        
        totalMatches++;
        
        emit MatchRecorded(fid1, fid2, block.timestamp);
    }
    
    /**
     * @dev Check if two users have matched
     * @param fid1 First user's Farcaster ID
     * @param fid2 Second user's Farcaster ID
     * @return bool Whether the match exists
     */
    function hasMatched(uint256 fid1, uint256 fid2) external view returns (bool) {
        if (fid1 > fid2) {
            (fid1, fid2) = (fid2, fid1);
        }
        bytes32 matchId = keccak256(abi.encodePacked(fid1, fid2));
        return matches[matchId].exists;
    }
    
    /**
     * @dev Get all match IDs for a user
     * @param fid User's Farcaster ID
     * @return bytes32[] Array of match IDs
     */
    function getUserMatches(uint256 fid) external view returns (bytes32[] memory) {
        return userMatches[fid];
    }
    
    /**
     * @dev Get match details by match ID
     * @param matchId The match ID
     * @return Match struct containing match details
     */
    function getMatch(bytes32 matchId) external view returns (Match memory) {
        require(matches[matchId].exists, "Match does not exist");
        return matches[matchId];
    }
}
