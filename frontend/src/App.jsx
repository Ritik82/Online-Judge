import { Route, Routes } from 'react-router-dom'
import './App.css'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Compiler from './pages/Compiler'
import Admin from './pages/Admin'
import Problems from './pages/Problems'
import ProblemSolving from './pages/ProblemSolving'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'

function App() {
  return (
    <div className='App'>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/home' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<Signup />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/compiler' element={<Compiler />} />
        <Route path='/admin' element={<Admin />} />
        <Route path='/problems' element={<Problems />} />
        <Route path='/problem/:problemId' element={<ProblemSolving />} />
        <Route path='/profile/:username' element={<Profile />} />
        <Route path='/leaderboard' element={<Leaderboard />} />
      </Routes>
    </div>
  )
}

export default App
