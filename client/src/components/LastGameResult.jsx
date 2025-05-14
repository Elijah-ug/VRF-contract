import React, { useEffect, useState } from 'react';
import { useLottery } from '../context/UseLotteryContextProvider';

const LastGameResult = () => {
    const { contract } = useLottery();
    const [winners, setWinners] = useState([]);
    const [players, setPlayers] = useState([]);
    const [correctAnswer, setCorrectAnswer] = useState("");

    useEffect(() => {
        const fetchGameResult = async () => {
            if (!contract) return
            try {
                const winnersFromContract = await contract.getWinners();
                const correctResult = await contract.randomResult();
                const allPlayers = await contract.returnPlayers();
                // await allPlayers.wait();
                setPlayers(allPlayers);
                setCorrectAnswer(Number(correctResult));
                setWinners(winnersFromContract);
            } catch (error) {
                // alert("Failed to load the results");
                console.log("Failed to load the results: ", error)
            }

        }
        fetchGameResult()
    }, [contract])
    return (
        <div>
            <div className="p-4  rounded-lg shadow-md text-center w-lg mt-10 ml-10">
            <h2 className="text-lg font-semibold mb-2">Last Round Results</h2>
            <p><strong>Correct Number:</strong> {correctAnswer? correctAnswer: ""}</p>
            <p><strong>Winner(s):</strong></p>
            <ul className="list-disc list-inside">
                {winners.length > 0 ? (
                    winners.map((winner, index) => (
                        <li key={index}>{winner}</li>
                    ))
                ) : (
                    <li>No winner(s) last round</li>
                )}
            </ul>
            </div>
            <div className=" mt-2 bg-blue-20">
            <h2 className="text-lg font-semibold mb-2">Last Round Results</h2>
                {
                    players.map((player) =>
                        <p className="text-green-600">{ player.slice(0, 6)}...{ player.slice(-4)}</p>
                    )
                }
            </div>
        </div>
    );
}

export default LastGameResult;
