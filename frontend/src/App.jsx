import React from 'react'
import Verify from './pages/Verify'
import Dashboard from './pages/Dashboard'
import Navbar from './components/Navbar'
import Timeline from './pages/Timeline'
import { BrowserRouter , Routes, Route} from 'react-router-dom'
const App = () => {
  return (
    <BrowserRouter>
      <Navbar/>
      <Routes>
        <Route path="/" element={<Dashboard/>}></Route>
        <Route path="/verify" element={<Verify/>}></Route>
       <Route path="/timeline/:id" element={<Timeline />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App