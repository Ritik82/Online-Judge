import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './pages/login'
import Signup from './pages/signup'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'

function App() {
  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </div>
  )
}

export default App
