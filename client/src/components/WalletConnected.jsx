import React, { useEffect } from 'react';
import { useLottery } from '../context/UseLotteryContextProvider';

const WalletConnected = () => {
    const { account, connectWallet, isLoading, error } = useLottery();
    useEffect(() => {
        console.log(account)
    }, [account])

    return (
        <div className="flex flex-col items-center justify-center gap-4 p-4 w-lg">
            {
                account ?
                    (<div className="bg-green-100 text-green-700 px-4 py-2 rounded-xl shadow">
                        Conected: {account.slice(0, 6)}...{account.slice(-4)} </div>) :
                    (<button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-xl shadow cursor-pointer"
                        onClick={() => connectWallet(true)} disabled={isLoading} >
                        {isLoading ? "Connecting..." : "Connect Wallet"}
                    </button>  )
            }
            {
                error && (
                    <div>An Error ⚠️{ error}</div>
                )
            }
        </div>
    );
}

export default WalletConnected;
