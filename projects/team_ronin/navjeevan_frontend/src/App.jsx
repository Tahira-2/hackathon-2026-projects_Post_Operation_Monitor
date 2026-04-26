import { useState } from 'react'
import {Routes,Route} from "react-router-dom";
import CommunityDashboard from "./components/CommunityDashboard";



function App() {
  const [count, setCount] = useState(0)

  return (

    <Routes>
    <Route path="/community" element={<CommunityDashboard />} />
    </Routes>

  )
}

export default App
