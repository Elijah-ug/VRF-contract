import React, { useEffect, useState } from 'react';
import WalletConnected from './WalletConnected';
import { NavLink } from 'react-router-dom';
import Guess from './Guess';
import { useLottery } from '../context/UseLotteryContextProvider';
import { ethers } from 'ethers';
// import StartLotteryButton from './StartLotteryButton';

const Home = () => {
    const { contract, account } = useLottery();
    const [resetSuccess, setResetSuccess] = useState(null);
    const [loading, setLoading] = useState(false);
    const [playerBalanceInContract, setPlayerBalanceInContract] = useState(null)
    useEffect(() => {
        const getContractBasicInfo = async () => {
            if (contract && account) {
                const balance = await contract.playerBalances(account);
                setPlayerBalanceInContract(ethers.formatEther(balance))
                console.log("Failed to return detailes")
            }

        }
        getContractBasicInfo()
    }, [account, contract]);

    // Function to call the contract's resetNextRound method
    const resetGame = async () => {
        if (!contract || !account) return alert("Please connect your wallet"); // Ensure wallet is connected

        try {
            setLoading(true); // Set loading state to true while waiting for transaction to complete
            const tx = await contract.resetNextRound(); // Call the reset function from the contract
            await tx.wait();  // Wait for the transaction to be mined
            setResetSuccess(true); // Set reset success to true if the transaction is successful
            console.log("Game reset successfully.");
        } catch (error) {
            console.error("Error resetting the game:", error); // Log any errors
            setResetSuccess(false); // Set reset success to false if there was an error
        } finally {
            setLoading(false); // Set loading state to false once the transaction is complete
        }
    };
    console.log("The balance is: ", playerBalanceInContract)
    return (
        <div className="p-4 rounded-lg shadow-md text-center w-lg mt-10 ml-10">
            <div className="text-lg mt-4 text-blue-700">
                {playerBalanceInContract !== null ? `Your Balance: ${playerBalanceInContract} ETH` : 'Loading balance...'}
            </div>
            <WalletConnected />
            {/* <Guess /> */}
            <div className="text-center text-green-600 mt-4">

                 <NavLink  to="deposit">Deposit</NavLink>
            </div>
            <div className="mt-4">
                <button
                    onClick={resetGame} // On button click, reset the game
                    className="bg-indigo-600 text-white px-10 py-2 rounded hover:bg-indigo-700"
                    disabled={loading} // Disable the button if the reset is in progress
                >
                    {loading ? "Resetting..." : "Reset Game"} {/* Display loading text if reset is in progress */}
                </button>
            </div>

        </div>
    );
}

export default Home;
