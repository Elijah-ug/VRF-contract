import React, { useState } from 'react';
import { useLottery } from '../context/UseLotteryContextProvider';

const Guess = () => {
   const { account, contract, isLoading } = useLottery();
       const [guess, setGuess] = useState("")
       const [loading, setLoading] = useState(false)
       const handleSubmitNumber = async (e) => {
           e.preventDefault()
           if (!account || !contract) return alert("Please connect your wallet!")
           const num = parseInt(guess);
           try {
               setLoading(true)
               if (isNaN(num) || num < 0 || num > 15) {
                    alert("Guess must be between 1 and 15");
                   setGuess("")
                   return;
               } else {
                  const tx = await contract.submitGuess(num)
                  await tx.wait()
                  alert("Guess Submitted!");
                  setGuess("")
               }

           } catch (error) {
               console.log(error)
               alert("Guess Failed!");
           } finally {
               setLoading(false)
           }
       }
       return (
           <div className="p-4 border rounded-lg shadow-md text-center w-lg mt-10">
               <form onSubmit={handleSubmitNumber} className="p-4 border rounded-lg shadow-md">
                   <h2 className="text-xl font-semibold mb-2">Guess the Number (1-15)</h2>
                   <input onChange={(e) => setGuess(e.target.value)} type="number" min="1" max="15" value={guess}
                        placeholder="Guess the number between 1 and 15" className="border p-2 rounded w-full mb-2" required />
                   <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                       disabled={isLoading || loading} type="submit">{loading ? "Submitting..." : "Submit Guess"}</button>
               </form>
           </div>
       );
   }

export default Guess;
