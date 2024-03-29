// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "hardhat/console.sol";

uint256 constant DEFAULT_UPVOTE = 0;
uint256 constant DEFAULT_DOWNVOTE = 0;

contract Hip {
    using Counters for Counters.Counter;
    Counters.Counter private recId;
    struct Rec {
        address sender;
        uint256 recId;
        uint256 timestamp;
        string artist;
        string song;
        string link;
        uint256 upvotes;
        uint256 downvotes;
    }
    Rec[] private recs;
    mapping(address => uint256) private lastRecTimestamp;
    /* uint256 private seed; */
    event NewRec(
        address sender,
        uint256 recId,
        uint256 timestamp,
        string artist,
        string song,
        string link,
        uint256 upvotes,
        uint256 downvotes
    );

    constructor() payable {
        recId.increment();
        /* seed = (block.timestamp + block.difficulty) % 100; */
    }

    function rec(
        string memory _artist,
        string memory _song,
        string memory _link
    ) external {
        require(
            lastRecTimestamp[msg.sender] + 15 seconds < block.timestamp,
            "wait 15 seconds before making another rec"
        );
        uint256 _recId = recId.current();
        Rec memory newRec = Rec(
            msg.sender,
            _recId,
            block.timestamp,
            _artist,
            _song,
            _link,
            DEFAULT_UPVOTE,
            DEFAULT_DOWNVOTE
        );
        recs.push(newRec);
        lastRecTimestamp[msg.sender] = block.timestamp;
        /* seed = (block.difficulty + block.timestamp + seed) % 100;
        if (seed <= 50) {
            uint256 prize = 0.0001 ether;
            require(
                prize <= address(this).balance,
                "No more $ left in contract"
            );
            (bool success, ) = (msg.sender).call{value: prize}("");
            require(success, "Failed to withdraw $ from contract");
        } */
        recId.increment();
        emit NewRec(
            msg.sender,
            _recId,
            block.timestamp,
            _artist,
            _song,
            _link,
            DEFAULT_UPVOTE,
            DEFAULT_DOWNVOTE
        );
    }

    function getRecs() external view returns (Rec[] memory) {
        return recs;
    }
}
