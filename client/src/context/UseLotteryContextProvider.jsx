import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { initialState, lotteryReducer } from './lotteryReducer';
import { ethers } from "ethers";
import contractAbi from "../utils/ColorDropLottery.json";
// import contractAbi from "../../../contract/artifacts/contracts/ColorDropLottery .sol/ColorDropLottery.json"
import { contractAddress } from '../config';

// 1. Create the context
export const LotteryContext = createContext();

// 2. Provider component
export const UseLotteryContextProvider = ({ children }) => {
    const [gameState, dispatch] = useReducer(lotteryReducer, initialState);

    // 3. Connect Wallet Function
    const connectWallet = async (requestAccounts = true) => {
        // Check if MetaMask is installed
        if (!window.ethereum) {
            dispatch({ type: "SET_ERROR", payload: "Metamask Not Found!" });
            return;
        }

        try {
            const provider = new ethers.BrowserProvider(window.ethereum);

            // Request accounts or check existing connection
            const accounts = await provider.send(
                requestAccounts ? "eth_requestAccounts" : "eth_accounts", []
            );

            // No accounts found
            if (!accounts.length) {
                dispatch({ type: "SET_ERROR", payload: "No accounts found!" });
                return;
            }

            const signer = await provider.getSigner();
            const account = await signer.getAddress(); // ✅ More reliable than accounts[0]
            const contract = new ethers.Contract(contractAddress, contractAbi.abi, signer);

            // Set all connected data into global state
            dispatch({
                type: "SET_CONNECTED",
                payload: { account, contract, provider, signer }
            });

            console.log("Connected account:", account); // ✅ Debugging
        } catch (error) {
            dispatch({ type: "SET_ERROR", payload: error.message });
        }
    };

    // 4. Auto-connect wallet on first load only
    useEffect(() => {
        connectWallet(false); // Try silent connection
    }, []); // ✅ Add dependency array to prevent infinite calls

    return (
        <LotteryContext.Provider value={{ ...gameState, connectWallet }}>
            {children}
        </LotteryContext.Provider>
    );
};

// 5. Custom hook to use the context
export const useLottery = () => useContext(LotteryContext);
