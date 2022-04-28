import React, { useEffect } from 'react';
import { Collapse, Typography, Button } from 'antd';
import styled from 'styled-components';
import { AppContext } from '../Context/AppProvider';
import { useNavigate, useParams } from 'react-router-dom';
import { BoardContext } from '../Board/Board';
import { db } from '../firebase/config';


const { Panel } = Collapse;

const PanelStyled = styled(Panel)`
    &&& {
            .ant-collapse-header,
        p {
            color: Red;
        }
        .ant-collapse-content-box {
            padding: 0 40px;
        }
        .add-room {
            color: black;
            padding: 2;
            background-color:  #d4d4d4;
            border: 2px solid black;
        }
    }
`;

const LinkStyled = styled(Typography.Link)`
    display: block;
    margin-bottom: 5px;
`;

export default function RoomList() {
    const {rooms, setIsAddRoomVisible,selectedRoomId, setSelectedRoomId} = React.useContext(AppContext);
    const {canvasRef,setElements,setTool} = React.useContext(BoardContext);
    const navigate = useNavigate();
    // const [searchParams,setSearchParams] = useSearchParams();

    // useEffect(() => {
    //     const value = searchParams.get("room");
    //     console.log(value);
    // },[searchParams]);


    useEffect(()=>{
        if(selectedRoomId !== ""){
            db.collection("boards").doc((String(selectedRoomId))).get().then((snap) => {
                if(snap.data()){
                    const data = JSON.parse(snap.data().elements);
                    setElements([...data]);
                }else{
                    setElements([]);
                    const canvasRef = document.getElementById('canvas');
                    if(canvasRef){
                        const context = canvasRef.getContext('2d');
                        context.clearRect(0, 0, canvasRef.width, canvasRef.height);
                    }
                    
                }
            })
            document.getElementsByClassName("TopBoard")[0].style.display = "inline";
            document.getElementsByClassName("ChatFrame")[0].style.display = "inline"; 
    
        }else{
            document.getElementsByClassName("TopBoard")[0].style.display = "none";
            document.getElementsByClassName("ChatFrame")[0].style.display = "none"; 
    
        }
    },[selectedRoomId])

    const handLeaveRoom = () =>{
        setSelectedRoomId("");
        const context = canvasRef.current.getContext('2d');
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        navigate(``); 

    }
    /**
     * {
     *  name: 'room name',
     *  description: 'mo ta',
     *  members: [uid1, uid2, ...]
     * }
     */
    //console.log(rooms);
    const handAddRoom = () =>{
        setIsAddRoomVisible(true);
    }
 
    return (
        <Collapse ghost defaultActiveKey={['1']}>
            <PanelStyled header="List of rooms" key='1' >
                {
                    rooms.map(room => <LinkStyled color="inherit" className='link' key={room.id} onClick={()=> {
                                        setSelectedRoomId(room.id);
                                        setTool("cursor");
                                        navigate(`?room=${btoa(room.id)}`);
                                    }}>
                                        {room.name}
                                    </LinkStyled>
                    )
                }
                <Button type='text' className='add-room' onClick={handAddRoom}>Create Room</Button>
                <Button type='text' className='Leave-room ant-btn-primary ant-btn-dangerous' 
                    onClick={handLeaveRoom} 
                    style={{border: "2px solid black"}}
                >
                    Leave Room
                </Button>
            </PanelStyled>
        </Collapse>
    );
}