import React, { useContext } from 'react';
import { Row, Col, Collapse } from 'antd';
import UserInfo from './UserInfo';
import styled from 'styled-components';
import RoomList from './RoomList';
import { AppContext } from '../Context/AppProvider';
//Style css custome
const SidebarStyled = styled.div`
    color: white;
    height: 100vh;
    position: absolute;
    
`;
const { Panel } = Collapse;


export default function Sidebar() {
    const {selectedRoom} = useContext(AppContext);
    
    return (
        
            <Collapse >
                <Panel header={selectedRoom? selectedRoom.name : "Rooms"}>
                    <SidebarStyled>
                    <Row>
                        <Col span={24}><UserInfo></UserInfo></Col>
                        <Col span={24}><RoomList></RoomList></Col>
                    </Row>
                    </SidebarStyled>
                    
                </Panel>
            </Collapse>
        
    );
}