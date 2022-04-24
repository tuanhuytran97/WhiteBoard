import React, { useContext, useState,useRef, useEffect } from 'react'
import { AuthContext } from './AuthProvider';
import useFirestore from '../hooks/useFirestore';


export const AppContext = React.createContext();

export default function AppProvider({children}){
    const [isAddRoomVisible, setIsAddRoomVisible] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [isInviteMemberVisible, setIsInviteMemberVisible] = useState('');
    const [isGiveControlMemberVisible, setIsGiveControlMemberVisible] = useState(false);

    const {
        user: { uid },
    } = React.useContext(AuthContext);
    
    const roomsCondition = React.useMemo(() => {
        return {
            fieldName : 'members',
            operator: 'array-contains',
            compareValue: uid,
        };
    },[uid]);
    //console.log(selectedRoomId);
    const rooms = useFirestore('rooms',roomsCondition);
    

    const selectedRoom = React.useMemo(
        () => rooms.find((room) => room.id === selectedRoomId) || {},
        [rooms, selectedRoomId]
    );


    //lấy members
    const usersCondition = React.useMemo(() => {
        return {
            fieldName: 'uid',
            operator: 'in',
            compareValue: selectedRoom.members,
        };
    }, [selectedRoom.members]);
    
    const members = useFirestore('users', usersCondition);
    // console.log({selectedRoom});

    const ControlCondition = React.useMemo(() => {
        return {
            fieldName: 'uid',
            operator: 'in',
            compareValue: selectedRoom.control,
        };
    }, [selectedRoom.members]);
    
    const Membercontrols = useFirestore('users', ControlCondition);
    //console.log({Membercontrols});

    return (
        <div>
            <AppContext.Provider 
                value={{
                    rooms,
                    members,
                    selectedRoom,
                    isAddRoomVisible,
                    setIsAddRoomVisible,
                    selectedRoomId, 
                    setSelectedRoomId,
                    isInviteMemberVisible,
                    setIsInviteMemberVisible,
                    Membercontrols,
                    isGiveControlMemberVisible,
                    setIsGiveControlMemberVisible
                    
                }}
            >
                {children}
            </AppContext.Provider>
        </div>
    )
}