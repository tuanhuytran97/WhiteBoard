import './App.css';
import Board from './components/Board/Board';
import Login from './components/Client/index';
import {Route, BrowserRouter, Routes, Link} from 'react-router-dom';
import AuthProvider from './components/Context/AuthProvider';
import AppProvider, { AppContext }  from './components/Context/AppProvider';
import AddRoomModal from './components/Modals/AddRoomModal';
import InviteMemberModal from './components/Modals/InviteMemberModal';
import NotFound from './components/Routes/NotFound';
import RoomList from './components/Communicate/RoomList';
import GiveControlMemberModal from './components/Modals/GiveControlMemberModal';


function App() {

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route element={<Login/>} path="/login" /> 
            <Route path="/board/"  element={<Board />}> 
              <Route path=":roomId"  element={<RoomList />}/> 
            </Route>
            <Route path='*' element={<NotFound/>}/>
          </Routes>
          <AddRoomModal/>
          <GiveControlMemberModal/>
          <InviteMemberModal/>
        </AppProvider>
      </AuthProvider>
      
    </BrowserRouter>
  )
}

export default App;
