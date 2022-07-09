import 'regenerator-runtime/runtime'
import React, { useEffect } from 'react'

import './global.css'
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Home from './pages/Home';
import Create from './pages/Create';
import Proposals from './pages/Proposals';
import ProposalDetail from './pages/ProposalDetail';
import Me from './pages/Me';

export default function App() {

  useEffect(() => {
    window.contract.get_proposals({from: "0", limit: 100}).then(result => console.log(result))
  }, [])
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<Create />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/proposals/:id" element={<ProposalDetail />} />
          <Route path="/me" element={<Me />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}
