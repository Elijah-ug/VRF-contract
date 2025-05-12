import React from 'react';
import { NavLink } from 'react-router-dom';
const navLinks = [
    { name: "Home", path: "/" },
    { name: "Deposit", path: "deposit" },
    { name: "Stake", path: "stake-form" },
    { name: "Results", path: "results" },
    { name: "Withdraw", path: "withdraw" },
  ];
const NavBar = () => {
    return (
        <nav className="bg-white shadow-md px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-2xl font-bold text-blue-600">LuckyGame</div>
        <ul className="hidden md:flex space-x-6 text-gray-700 font-medium">

              <NavLink to="/" >Home</NavLink>
              <NavLink to="deposit" >Deposit</NavLink>
              <NavLink to="stake-form" >Stake</NavLink>
              <NavLink to="results" >Results</NavLink>
              <NavLink to="withdraw" >Withdraw</NavLink>
              {/* <NavLink to="guess" >Guess</NavLink> */}
                </ul>
            </div>
            </nav>
    );
}

export default NavBar;
