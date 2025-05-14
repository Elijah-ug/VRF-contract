import { useEffect, useState } from 'react';
import { useLottery } from '../context/UseLotteryContextProvider';
import { ethers } from 'ethers';

const Withdraw = () => {
    const { contract, account, isLoading } = useLottery();
    const [withdrawAmount, setWithdrawAmount] = useState("")
    const [balance, setBalance] = useState(null)
    const [loading, setLoading] = useState(false)
    //fetch users balance
    console.log("Account: ", account)

        useEffect(() => {
    const fetchBalanceFromContract = async () => {
        if (!account || !contract) return;
        try {
            console.log("Account is: ", account)
            const userBal = await contract.playerBalances(account);
            setBalance(ethers.formatEther(userBal));
        } catch (error) {
            console.error("Failed to fetch player balance:...", error);
        }
    };

    fetchBalanceFromContract();
}, [account, contract]); // make sure these are dependencies

console.log("The user balance is:%%%%%% ", balance)
    // useEffect(() => {
    //     fetchBlanceFromContract()
    // }, [account, contract])

    const handleWithdraw = async () => {
        if (!account || !contract) return alert("Please connect your wallet");

        const withdrawEther = parseFloat(withdrawAmount)
        const balanceEther = parseFloat(balance)
        try {
            setLoading(true);
            if (isNaN(withdrawEther) || withdrawEther > balanceEther) {
                setWithdrawAmount("")
                alert("Stupid! You're trying to withdraw the amount you don't have");
                return;
            } else {
                const withdrawal = await contract.withdrawBalances(ethers.parseEther(withdrawEther.toString()));
                await withdrawal.wait();
                setWithdrawAmount("")
                alert("Withdraw successful!")
            }
        } catch (error) {
            alert("Withdraw Failed")
        } finally {
            setLoading(false);
        }
    }
    return (
        <div className="p-4 ml-10 rounded-lg shadow-md text-center w-lg mt-10">
            <form onSubmit={handleWithdraw} className="p-4  rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-2">Withdraw Balance</h2>
                <p className="mb-2 text-sm text-gray-600">Available: {balance} ETH</p>
                <input onChange={(e) => setWithdrawAmount(e.target.value)}
                step="0.0001" min="0" type="number" value={withdrawAmount} placeholder="Amount to withdraw in ETH"
                className="border p-2 rounded w-full mb-2" required />
                <button type="submit" className="bg-green-600 text-white px-8 py-2 rounded hover:bg-green-700 "
                disabled={isLoading || loading} >{loading ? "Withdrawing..." : "Withdraw"}</button>
            </form>
        </div>
    );
}

export default Withdraw;
