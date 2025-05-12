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
            <div className="p-4 border rounded-lg shadow-md text-center w-lg mt-10">
            <h2 className="text-lg font-bold mb-2">Last Round Results</h2>
            <p><strong>Correct Number:</strong> {correctAnswer}</p>
            <p><strong>Winner(s):</strong></p>
            <ul className="list-disc list-inside">
                {winners.length > 0 ? (
                    winners.map((winner, index) => (
                        <li key={index}>{winner}</li>
                    ))
                ) : (
                    <li>No winners last round</li>
                )}
            </ul>
            </div>
            <div className="bg-blue-200">
                {
                    players.map((player) =>
                        <p>{ player}</p>
                    )
                }
            </div>
        </div>
    );
}

export default LastGameResult;
