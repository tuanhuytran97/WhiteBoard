import React, { useState } from 'react'
import {useNavigate, useSearchParams} from 'react-router-dom'
import {auth} from '../firebase/config';
import {Spin} from 'antd';

//where to save the Auth's data
export const AuthContext = React.createContext();
export default function AuthProvider({children}){
    const [user, setUser] = useState({});
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [searchParams,setSearchParams] = useSearchParams();

    React.useEffect(() => {
        const unsubcribed = auth.onAuthStateChanged((user) => {
            if(user){
                const {displayName, email, uid, photoURL} = user;
                setUser({
                    displayName, email, uid, photoURL
                });
                setIsLoading(false);
                if(searchParams.get("room")){
                    navigate(`/board?room=${searchParams.get("room")}`);
                }else{
                    navigate('/board');
                }
                return;
            }else{
                setIsLoading(false);
                setUser({});
                navigate('/login');
            }
        });
        return () => {
            unsubcribed();
        }
    },[])

    return (
        <div>
            <AuthContext.Provider value={{user}}>
                {isLoading ? <Spin style={{ position: 'fixed', inset: 0 }} /> : children}
            </AuthContext.Provider>
        </div>
    )
}