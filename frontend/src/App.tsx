import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import { Sender } from './components/sender'
import { Receiver } from './components/Receiver'

function App() {


  return (
    <BrowserRouter>
      <Routes>
        <Route path='/sender' element={<Sender />} />
        <Route path='/receiver' element={<Receiver />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
