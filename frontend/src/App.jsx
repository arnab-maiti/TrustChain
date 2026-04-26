import React from 'react'
import Verify from './pages/Verify'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'
import Timeline from './pages/Timeline'
import CheckTrust from "./pages/CheckTrust";
import Login from "./pages/Login";
import { BrowserRouter , Routes, Route} from 'react-router-dom'
const App = () => {
  return (
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Dashboard/>}></Route>
        <Route path="/verify" element={<Verify/>}></Route>
       <Route path="/timeline/:id" element={<Timeline />} />
       <Route path="/check-trust" element={<CheckTrust />} />
       <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App