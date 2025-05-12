import React, { useEffect, useState } from 'react';
import { useLottery } from '../context/UseLotteryContextProvider';
import { ethers } from 'ethers';
import StartLotteryButton from './StartLotteryButton';
import { NavLink } from 'react-router-dom';
import Guess from './Guess';

const StkeForm = () => {
    const { account, contract, isLoading } = useLottery();
    const [stakeAmount, setStakeAmount] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [requiredStake, setRequiredStake] = useState(false);

    //stake from the contract

        const fetchRequiredStake = async() => {
            if (contract) {
                try {
                    const requiredStakeFromContract = await contract.requiredStakeAmount();
                     setRequiredStake(ethers.formatEther(requiredStakeFromContract)) //format to string in ETH
                } catch (error) {
                    console.log("Couldn't fetch the data: ", error)
                }
            }
        }
        useEffect(() => {
        fetchRequiredStake()
    }, [contract])
    console.log("requiredStakeFromContract: ", requiredStake)
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!contract || !account) return alert("Please connect your wallet");
        const amount = parseFloat(stakeAmount)
        try {
            setLoading(true);
            if (isNaN(amount) || amount < 0.0001) {
                alert("Please enter a valid amount greater than 0.0001 ETH");
                setStakeAmount("")
            } else {
                const tx = await contract.playerStake( ethers.parseEther(stakeAmount) )
                await tx.wait();
                const correctResult = await contract.randomResult();
                setCorrectAnswer(correctResult)
                fetchRequiredStake(); // ✅ Refetch in case this was the first stake
                alert("Stake successfully");
                setStakeAmount("")
            }
        } catch (error) {
            console.log(error);
            alert("Stake unsuccessful!")
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="p-4 border rounded-lg shadow-md text-center w-lg mt-10">
            {
                !correctAnswer ?
                    (<form onSubmit={handleSubmit} className="p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">Stake ETH</h2>
                <input onChange={(e) => setStakeAmount(e.target.value)} value={stakeAmount}
                    type="number" step="0.0001" placeholder="Enter stake amount in ETH" className="border p-2 rounded w-full mb-2" required/>
                <button type="submit" className="bg-indigo-600 text-white px-10 py-2 rounded hover:bg-indigo-700"
                disabled={loading || isLoading}>{loading ? "Staking..." : "Stake"}</button>
                    </form>) :
                    (<Guess/>)
            }
            <div>
            </div>
        </div>
    );
}

export default StkeForm;
