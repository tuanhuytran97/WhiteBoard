import React, { useState} from 'react'
import { AuthContext } from './AuthProvider';
import useFirestore from '../hooks/useFirestore';

//where to save the App's data
export const AppContext = React.createContext();

export default function AppProvider({children}){
    const [isAddRoomVisible, setIsAddRoomVisible] = useState(false);
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [isInviteMemberVisible, setIsInviteMemberVisible] = useState('');
    const [isGiveControlMemberVisible, setIsGiveControlMemberVisible] = useState(false);

    const {
        user: { uid },
    } = React.useContext(AuthContext);
    
    //Take rooms from firestore
    const roomsCondition = React.useMemo(() => {
        return {
            fieldName : 'members',
            operator: 'array-contains',
            compareValue: uid,
        };
    },[uid]);
    const rooms = useFirestore('rooms',roomsCondition);
    
    //find selected room
    const selectedRoom = React.useMemo(
        () => rooms.find((room) => room.id === selectedRoomId) || {},
        [rooms, selectedRoomId]
    );


    //Take rooms from members
    const usersCondition = React.useMemo(() => {
        return {
            fieldName: 'uid',
            operator: 'in',
            compareValue: selectedRoom.members,
        };
    }, [selectedRoom.members]);
    const members = useFirestore('users', usersCondition);

    //Take members Control
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