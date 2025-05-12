const { expect } = require("chai");
const { ethers } = require("hardhat");

describe( "ColorDropLottery Lottery", () => {
    let colorDropLottery, owner, player1, player2
    const minDeposit = ethers.parseEther("0.0001");
    const stake = ethers.parseEther("0.001");
    const subscriptionId = 123;

    beforeEach(async () => {
        [owner, player1, player2] = await ethers.getSigners()
        const ColorDropLottery = await ethers.getContractFactory("ColorDropLottery")
        colorDropLottery = await ColorDropLottery.deploy(subscriptionId, minDeposit)
        await colorDropLottery.waitForDeployment();
    });

    // Test1: A player must deposit to join the game
    it("Should allow a player to deposit to join the game", async () => {
        //player1 joins with minimum deposit
        await colorDropLottery.connect(player1).depositToJoinGame({ value: minDeposit });
        // check if player1 was added to players array
        const players = await colorDropLottery.returnPlayers()
        expect(players).to.include(player1.address);
        // check if player's balance was stored
        const balance = await colorDropLottery.playerBalances(player1.address);
        expect(balance).to.equal(minDeposit);
    })
    // Test2: requiring the min deposit
    it("Should require minimum deposit to join the game", async () => {
        await expect(colorDropLottery.connect(player1).depositToJoinGame({
            value: ethers.parseEther("0.00001")})).to.be.revertedWith("Invalid entry fee");
    })
    // Test3: It should allow the first player to stake(set the stake amount)
    it("Should allow the first player to decide the stake aount", async () => {
        // both must have enough deposit
        await colorDropLottery.connect(player1).depositToJoinGame({ value: stake })
        await colorDropLottery.connect(player2).depositToJoinGame({ value: stake })
        // first player to set the stake
        await colorDropLottery.connect(player1).playerStake({ value: stake })
        const gameStake = await colorDropLottery.requiredStakeAmount();
        expect(gameStake).to.equal(stake)
        // other players must match the same deposit
        await colorDropLottery.connect(player2).playerStake({ value: stake });
        // check totalStaked amount
        const totalStaked = await colorDropLottery.totalStaked();
        expect(totalStaked).to.equal(stake * 2);
    });
    it("should increase the number of stakers", async () => {
        await colorDropLottery.connect(player1).depositToJoinGame({value: stake})
        await colorDropLottery.connect(player2).depositToJoinGame({value: stake})
        await colorDropLottery.connect(player1).playerStake({value: stake})
        await colorDropLottery.connect(player2).playerStake({ value: stake })
        const totalStakers = await colorDropLottery.totalStakers();
        expect(totalStakers).to.equal(2);
    })
    it("Should allow players to guess after staking", async () => {
        //player first depsits
        await colorDropLottery.connect(player1).depositToJoinGame({value: stake})
        await colorDropLottery.connect(player2).depositToJoinGame({ value: stake })
        //secondly, a player stakess
        await colorDropLottery.connect(player1).playerStake({value: stake})
        await colorDropLottery.connect(player2).playerStake({ value: stake })
        // player submits a guess
        await colorDropLottery.connect(player1).submitGuess(5);
        // check if the guess is correct
        const guess = await colorDropLottery.guesses(player1.address)
        expect(guess).to.equal(5)
    })
    it("Should allow the winner(s) to withdraw", async () => {
        // player deposits nd stakes
        await colorDropLottery.connect(player1).depositToJoinGame({ value: stake });
        await colorDropLottery.connect(player1).playerStake({ value: stake });
        //in case a player wins
        const prize = ethers.parseEther("0.0001");

        const winner0 = await colorDropLottery.winners(0)
        expect(winner0).to.equal(player1.address);
        const tx = await colorDropLottery.withdrawBalances(prize);
        await tx.wait();


    })
});
