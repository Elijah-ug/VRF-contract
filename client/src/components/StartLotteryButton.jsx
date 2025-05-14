import React, { useEffect, useState } from 'react';
import { useLottery } from '../context/UseLotteryContextProvider';

const StartLotteryButton = () => {
    const { contract, account, isLoading } = useLottery();
    const [loading, setLoading] = useState(false);
    const [gameStatus, setGameStatus] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [isButtonDisabled, setIsButtonDisabled] = useState(true);

    const checkGameConditions = async () => {
        if (!account || !contract) return alert("Plese connect your wallet");
        try {
            const gameActive = await contract.gameActive();
            const players = await contract.returnPlayers();
            const allStaked = players.every((player) => player !== account && contract.hasStaked(player));//check if all have staked

            if (gameActive && players.length >= 2 && allStaked) {
                setIsButtonDisabled(false);
                setGameStatus("Ready to start")
            } else {
                setIsButtonDisabled(true);
                setGameStatus("Waiting for players to join!");
            }
        } catch (error) {
            console.log(error)
            setGameStatus("Error checking game status");
        }
    }
    useEffect(() => {
        checkGameConditions()
    }, [account, contract])
    const handleStartLottery = async () => {
        if (loading) return;
        try {
            setLoading(true)
            const requestRandom = await contract.requestRandomNumber();
            await requestRandom.wait();
            const correctResult = await contract.randomResult();
            setCorrectAnswer(correctResult)
            alert("Lottery started!");

        } catch (error) {
            console.log(error);
            alert("Game failed to start!");
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-4  rounded-lg shadow-md text-center w-lg mt-10">
            <h2 className="text-lg font-bold mb-2">Game Status: {gameStatus}</h2>

            <div>
                {!correctAnswer ? (<button
                onClick={handleStartLottery}
                disabled={isLoading || loading || isButtonDisabled}
                className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ${isButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : ''}`}>
                {loading ? "Generating Random Number..." : "Generate Random Number"}
            </button>):  (<h2 className="text-lg font-bold mb-2">Correct Answer: { correctAnswer || "..."}</h2>)}
            </div>
        </div>
    );
}

export default StartLotteryButton;
