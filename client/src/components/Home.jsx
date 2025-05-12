import React, { useEffect, useState } from 'react';
import WalletConnected from './WalletConnected';
import { NavLink } from 'react-router-dom';
import Guess from './Guess';
import { useLottery } from '../context/UseLotteryContextProvider';
import { ethers } from 'ethers';
// import StartLotteryButton from './StartLotteryButton';

const Home = () => {
    const { contract, account } = useLottery();
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
    console.log("The balance is: ", playerBalanceInContract)
    return (
        <div className="p-4 rounded-lg shadow-md text-center w-lg mt-10">
            <div className="text-lg mt-4 text-blue-700">
                {playerBalanceInContract !== null ? `Your Balance: ${playerBalanceInContract} ETH` : 'Loading balance...'}
            </div>
            <WalletConnected />
            {/* <Guess /> */}
            <div className="text-center text-green-600 mt-4">

                 <NavLink  to="deposit">Deposit</NavLink>
            </div>

        </div>
    );
}

export default Home;
