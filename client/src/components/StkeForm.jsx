import React, { useEffect, useState } from 'react';
import { useLottery } from '../context/UseLotteryContextProvider';
import { ethers } from 'ethers';
import StartLotteryButton from './StartLotteryButton';
import { NavLink } from 'react-router-dom';
import { RiRefreshLine } from "react-icons/ri";
import Guess from './Guess';

const StkeForm = () => {
    const { account, contract, isLoading } = useLottery();
    const [stakeAmount, setStakeAmount] = useState("");
    const [correctAnswer, setCorrectAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const [requiredStake, setRequiredStake] = useState(false);
    const [playerStaked, setPlayerStaked] = useState(false);
    const [triggerRandNum, setTriggerRandNum] = useState(false);

    //stake from the contract

        const fetchRequiredStake = async() => {
            if (contract) {
                try {
                    const requiredStakeFromContract = await contract.requiredStakeAmount();
                    setRequiredStake(ethers.formatEther(requiredStakeFromContract)) //format to string in ETH
                    const hasPlayerStaked = await contract.hasStaked(account);
                    setPlayerStaked(hasPlayerStaked)
                    console.log("Echeck hasStaked: ", hasPlayerStaked)
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
        const amount = parseFloat(stakeAmount);

        try {
          setLoading(true);

          if (isNaN(amount) || amount < 0.0001) {
            alert("Please enter a valid amount greater than 0.0001 ETH");
            setStakeAmount("");
            return;
          }

          // Stake
          const tx = await contract.playerStake(ethers.parseEther(stakeAmount));
          await tx.wait();
          setStakeAmount("");
          alert("Stake successful!");

          // Try to trigger VRF
          try {
            const triggerRandom = await contract.checkTimeoutAndCloseEntry();
            setTriggerRandNum(triggerRandom);
            console.log("Trigger VRF result: ", triggerRandom);
          } catch (innerErr) {
            console.log("VRF trigger failed (probably too early):", innerErr);
          }

          // Try fetching random result
          try {
            const correctResult = await contract.randomResult();
              setCorrectAnswer(correctResult.toString());
              console.log("VRF trigger Correct Result :", correctResult);
          } catch (fetchErr) {
            console.log("Random result not yet set");
          }

          fetchRequiredStake();

        } catch (error) {
          console.log(error);
          alert("Stake unsuccessful!");
        } finally {
          setLoading(false);
        }
    };
    //reset
    const handleEndRound = async () => {
        // Reset states
        // setCorrectAnswer("");
        // setPlayerStaked(false);
        // setTriggerRandNum(false);
        // setStakeAmount(""); // Clear stake input
        // setRequiredStake(false); // Clear required stake if you show that info again

        // Call contract function to reset round (if you have one)
        try {
            const tx = await contract.resetNextRound();
            await tx.wait();
            alert("Round has been reset. New round started!");
        } catch (error) {
            console.error("Error resetting round", error);
        }
    }

    return (
        <div className="p-4 ml-10 rounded-lg shadow-md text-center w-lg mt-10">
            <RiRefreshLine onClick={handleEndRound} className="text-green-600" />
            {
                !playerStaked ?
                    (<form onSubmit={handleSubmit} className="p-4 rounded-lg shadow-md">
                        <h2 className="text-xl font-semibold mb-2">Stake ETH</h2>
                        <h2 className="text-lg font-sm mb-2">Required Stake: {requiredStake}</h2>
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
