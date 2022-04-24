import React, { useState } from "react";
import {Row,Col, Button} from 'antd';
import Sidebar from './Sidebar';
import 'antd/dist/antd.css';
import ChatWindow from "./ChatWindow";
export default function ChatRoom(){

    return (
        <div>
            <Row>
                <Col span={20}>
                    <ChatWindow />
                </Col>
                <Col span={4}>
                    <Sidebar />
                </Col>
            </Row>
        </div>
    );
}