import React from 'react';
import { Button, Avatar, Typography } from 'antd';
import styled from 'styled-components';

import { auth } from './../firebase/config';
import { AuthContext } from '../../components/Context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../Context/AppProvider';

//Style css custome
const WrapperStyled = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(82, 38, 83);
    width: 93%;
    margin-top: 10px;
    
    
    .username {
        color: black;
        margin-left: 5px;
    }
    .btnLogOut{
        color: black;
        background-color: #d4d4d4;
        border: 2px solid black;
        margin-right: 25px;
    }
    `;

export default function UserInfo() {
    const {user : {
        displayName,
        photoURL
    }} = React.useContext(AuthContext);
    const navigate = useNavigate();
    const { setSelectedRoomId} = React.useContext(AppContext);
    const handleLogout = () => {
        setSelectedRoomId('');
        navigate(``); 
        auth.signOut();
        
    }
    return (
        <WrapperStyled>
            
            <div>
                <Avatar src={photoURL}>{photoURL ? '' : displayName?.charAt(0)?.toUpperCase()}</Avatar>
                <Typography.Text className='username'>{displayName}</Typography.Text>
            </div>
            <Button className='btnLogOut' ghost onClick={handleLogout}>Log out</Button>
            
        </WrapperStyled>
        
    )
}