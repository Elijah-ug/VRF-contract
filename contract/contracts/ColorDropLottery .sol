// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import {VRFCoordinatorV2Interface} from "@chainlink/contracts/src/v0.8/vrf/interfaces/VRFCoordinatorV2Interface.sol";
import {VRFConsumerBaseV2} from "@chainlink/contracts/src/v0.8/vrf/VRFConsumerBaseV2.sol";

contract ColorDropLottery is VRFConsumerBaseV2 {

uint public constant max_players = 4;
uint public constant min_players = 2;
uint public constant time_out = 5 minutes;
uint256 public stakeAmount;
uint256 public minimumDepositAmount = 0.0001 ether;
uint public requiredStakeAmount;
uint public totalStakers;
address public owner;
bool public locked;

// ====game state====
address[] public players;
mapping(address => bool) public hasJoined;
mapping(address => uint8) public guesses;
mapping(address => bool) public hasDeposited;
mapping(address => bool) public hasStaked;
mapping(address => uint) public playerBalances;
mapping(address => bool) public hasGuessed;

bool public gameActive;
uint public gameStartTime;
bool public isGuessingOpen;
uint public totalStaked;
address[] public winners;
// ====Events====
event GameJoined(address indexed player, uint8 number);
event TimeOutTriggered(); //for front end logos
event EntryClosed();
event RandomRequested(uint requestId);
event RandomFulfilled(uint randomWord);
event PlayersStaked(address indexed player, uint amount);
event MinimumDepositUpdated(uint256 newAmount);
event Withdrawal(address indexed player, uint256 amount);


// ✅ 1. Store the VRF coordinator and key hash as constants
    address constant VRF_COORDINATOR = 0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE;
    bytes32 constant KEY_HASH = 0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71;
// === Chainlink VRF Settings ===
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 immutable subscriptionId;
    uint32 public callbackGasLimit = 200000;
    uint16 public requestConfirmations = 3;
    uint32 public numWords = 1;
    uint public randomResult;
    uint256 public lastRequestId;

// ====== non reentrency idifier ======
    modifier noReentrency {
        require(!locked, "Reentrency detected");
        locked = true;
        _;
        locked = false;
    }
    // ✅ 4. Constructor takes subscriptionId and initializes coordinator
    constructor(uint64 _subId, uint256 _depositAmount) VRFConsumerBaseV2 (VRF_COORDINATOR) {
        COORDINATOR = VRFCoordinatorV2Interface(VRF_COORDINATOR);
        subscriptionId = _subId;
        gameActive = true;
        minimumDepositAmount  = _depositAmount;
        owner = msg.sender;
    }

// ====Join game function====

function depositToJoinGame() external payable{
    require(msg.value >= minimumDepositAmount , "Invalid entry fee");
    require(players.length < max_players, "Game is full");
    require(!hasJoined[msg.sender], "You've already joined");
    // add players to the game
    players.push(msg.sender);
    hasJoined[msg.sender] = true;
    playerBalances[msg.sender] += msg.value;
    hasDeposited[msg.sender] = true;


    if(players.length == 1){
        gameActive = true;
    }
    //start the game if the minimum number of players reach
    if(players.length == min_players){
        gameStartTime = block.timestamp;
    }
    emit GameJoined(msg.sender, 0);
}

// ===== helper fn to request a random num fro chainlink ======
function _requestRandomNumber() private{
     uint requestId = COORDINATOR.requestRandomWords( KEY_HASH, subscriptionId, requestConfirmations, callbackGasLimit, numWords );
            lastRequestId = requestId;
            emit RandomRequested(requestId);
}
// ==== stake function ====
function playerStake(uint256 amount) external{
    require(hasDeposited[msg.sender], "You haven't deposited yet");
    require(!hasStaked[msg.sender], "You have already staked");
    require(playerBalances[msg.sender] >= requiredStakeAmount, "Invalid stake amount");
    // ensure that the stake is the same for all players
    if(totalStakers == 0){
        requiredStakeAmount = amount;
    }else{
        require(amount == requiredStakeAmount, "The stake amount should be equal for all participants");
    }

    hasStaked[msg.sender] = true;
    playerBalances[msg.sender] -= requiredStakeAmount;
    totalStaked += amount;
    totalStakers ++;
    if(totalStakers == players.length){
        isGuessingOpen = true;
    }
    if(block.timestamp >= gameStartTime + time_out && !gameActive){
        gameActive = false;
        emit EntryClosed(); // 🔔 Inform frontend that game entry is closed
       _requestRandomNumber();
    }
    emit PlayersStaked(msg.sender, amount);
}
// ===== function to adjust the deposit amount
function updateDepositAmount(uint256 _newAmount) external{
    require(msg.sender == owner, "The admin only can update the deposit amount");
    minimumDepositAmount  = _newAmount;
    emit MinimumDepositUpdated(_newAmount);

}

// ==== submit guess function ====
function submitGuess(uint8 number) external{
    require(isGuessingOpen, "Guessing is not yet open");
    require(hasStaked[msg.sender], "You haven't staked yet");
    require(!hasGuessed[msg.sender], "You've already guessed");
    require(number >= 1 && number <= 15, "Number must be between 1 and 15");

    guesses[msg.sender] = number;
    hasGuessed[msg.sender] = true;

    emit GameJoined(msg.sender, number);
}
// ===== function to resent the next round =====
function resetNextRound() internal{
    // require()
    for(uint i = 0; i < players.length; i ++){
        address player = players[i];
        hasStaked[player] = false;
        hasDeposited[player] = false;
        hasGuessed[player] = false;
        hasJoined[player] = false;
        guesses[player] = 0;
        playerBalances[player] = 0;

    }
    delete players;
    delete winners;

    totalStaked = 0;
    totalStakers = 0;
    requiredStakeAmount = 0;
    gameStartTime = 0;
    randomResult = 0;
    gameActive = true;
    isGuessingOpen = false;
}
 // // === Close Entry After Timeout (does not end game yet) ===
 function checkTimeoutAndCloseEntry() external{
    require(gameActive == true, "The game has ended");
    require(block.timestamp >= gameStartTime + time_out, "Time out not yet reached");
    require(players.length >= 2, "You can't play the game alone");
    // Here, in the next step, we’ll request randomness
    emit EntryClosed();
    gameActive = false;
 }
// === Request Random Number from Chainlink ===
function requestRandomNumber() external{
    require(players.length == totalStakers);
    require(!gameActive, "Game still receiving entries");
    require(players.length >= min_players, "Not enough players");

    _requestRandomNumber();
}
// === Callback from Chainlink VRF ===
function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override{
    randomResult = (randomWords[0] % 15) + 1;
    emit RandomFulfilled(randomResult);
    // store winners temporarily
    uint winnerCount = 0;

    // loop through all the players to check for the winner
    for(uint i = 0; i < players.length; i++){
        if(guesses[players[i]] == randomResult){
            winners.push(players[i]);
            winnerCount ++;
        }
    }

    if(winnerCount > 0){
        uint rewardPerWinner = totalStaked / winnerCount;
        for(uint i = 0; i < winners.length; i++){
                // payable(winners[i]).transfer(rewardPerWinner);
                playerBalances[winners[i]] += rewardPerWinner;

        }
    }
    resetNextRound();
}
// =====withdraw balances ====
function withdrawBalances(uint _withdrawal) external payable noReentrency{
    require(playerBalances[msg.sender] >= _withdrawal, "Insufficient Balance!");
    playerBalances[msg.sender] -= _withdrawal;
    payable(msg.sender).transfer(_withdrawal);

    emit Withdrawal(msg.sender, _withdrawal);
}
// === view function to return all players
 function returnPlayers() external view returns(address[] memory){
    return players;
}

// ==== winners function ====
function getWinners() external view returns(address[] memory){
    return winners;
}

}
