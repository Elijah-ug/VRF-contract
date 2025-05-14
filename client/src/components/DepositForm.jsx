import React, { useState } from 'react';
import { useLottery } from '../context/UseLotteryContextProvider';
import { ethers } from 'ethers';
import { NavLink } from 'react-router-dom';

const DepositForm = () => {
    const { account, contract, isLoading } = useLottery();
    const [depositAmount, setDepositAmount] = useState("")
    const [loading, setLoading] = useState(false)
    const [deposit, setDeposit] = useState(false)
    //check network
    const checkNetwork = async () => {
        const networkConnected = await window.ethereum.request({ method: "eth_chainId" });
        const baseSepolia = "0x14a34";
        if (networkConnected !== baseSepolia) {
            console.log(`connect to the right network${baseSepolia}`)
        }
    }
    // checkNetwork()
    const handleDeposit = async (e) => {
        e.preventDefault()
        if (!account || !contract) return alert("Please connect your wallet!")
        const amount = parseFloat(depositAmount);
        try {
            setLoading(true)

            if (isNaN(amount) || amount < 0.001) {
                 alert("Please enter a valid amount");
                setDepositAmount("")
                return;
            } else {
               const tx = await contract.depositToJoinGame({ value: ethers.parseEther(amount.toString()) })
                await tx.wait()
                const playerBalance = await contract.playerBalances(account)
                console.log("playerBalance: ", playerBalance.toString())
                setDeposit(playerBalance)
               alert("Deposit successful!");
               setDepositAmount("")
            }

        } catch (error) {
            console.log(error)
            const message =
        error?.info?.error?.message || // Inside revert errors
        error?.info?.message ||        // General info
        error?.shortMessage ||         // ethers-specific short message
        error?.message ||              // Fallback general message
        "Deposit failed! Unknown error";

    alert(message);
        } finally {
            setLoading(false)
        }
    }
    return (
        <div className="p-4 border rounded-lg shadow-md text-center w-lg mt-10 ml-10">
           <h3 className="text-center"> {deposit ? `${ethers.formatEther(deposit)} ETH` : "No deposit yet"} </h3>

            <form onSubmit={handleDeposit} className="p-4 rounded-lg shadow-md">
                <input onChange={(e) => setDepositAmount(e.target.value)} type="number" step="0.0001" value={depositAmount}
                     placeholder="Enter deposit amount in ETH" className="border p-2 rounded w-full mb-2" required />
                <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    disabled={isLoading || loading} type="submit">{loading ? "Depositing..." : "Deposit"}</button>
            </form>
            {/* <NavLink className="text-center text-green-600 mt-4" to="/guess">Guess The Number</NavLink> */}
        </div>
    );
}

export default DepositForm;
