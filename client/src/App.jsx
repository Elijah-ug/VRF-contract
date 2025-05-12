import { Route, Router, Routes } from 'react-router-dom';
import './App.css';
import DepositForm from './components/DepositForm';
import Guess from './components/Guess';
import LastGameResult from './components/LastGameResult';
import StartLotteryButton from './components/StartLotteryButton';
import StkeForm from './components/StkeForm';
import WalletConnected from './components/WalletConnected';
import Withdraw from './components/Withdraw';
import Home from './components/Home';
import NavBar from './navigation/NavBar';

const App = () => {
  return (
    <div className="">
    <div className="w-2xl bg-gray-300 p-6 text-center mx-100 mt-10">
      <NavBar/>
      <Routes>
          <Route path="/" element={<Home />} />
          <Route path="deposit" element={<DepositForm />} />
          <Route path="stake-form" element={<StkeForm />} />
          <Route path="guess" element={<Guess />} />
          {/* <Route path="start-lottery" element={<StartLotteryButton />} /> */}
          <Route path="results" element={<LastGameResult />} />
          <Route path="withdraw" element={<Withdraw />} />

      </Routes>
      {/* <WalletConnected /> */}
      {/* <DepositForm /> */}
      {/* <StkeForm /> */}
      {/* <Guess /> */}
      {/* <StartLotteryButton/> */}
      {/* <LastGameResult /> */}
      {/* <Withdraw/> */}
      </div>
      </div>
  );
}

export default App;
