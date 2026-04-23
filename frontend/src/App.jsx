import React from 'react'
import Verify from './pages/Verify'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'
import { BrowserRouter , Routes, Route} from 'react-router-dom'
const App = () => {
  return (
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Dashboard/>}></Route>
        <Route path="/verify" element={<Verify/>}></Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App