import React, { useContext, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Button, Tooltip, Avatar, Form, Input, Alert } from 'antd';
import { UserAddOutlined, DownOutlined } from '@ant-design/icons';
import Message from './Message';
import { AppContext } from '../Context/AppProvider';
import { AuthContext } from '../Context/AuthProvider';
import { addDocument } from '../firebase/service';
import useFirestore from '../hooks/useFirestore';
//Style css custome
const HeaderStyled = styled.div`
    display: flex;
    justify-content: space-between;
    height: 75px;
    padding: 0 16px;
    align-items: center;
    border-bottom: 1px solid rgb(230, 230, 230);
    .header {
        &__info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        }

        &__title {
            margin: 0;
            font-weight: bold;
            font: font: small-caps bold 24px/1 sans-serif;
        }

        &__description {
            font-size: 12px;
            font: italic 1.2em "Fira Sans", serif;
        }
    }
`;
//Style css custome
const ButtonGroupStyled = styled.div`
    display: flex;
    align-items: center;
`;
//Style css custome
const WrapperStyled = styled.div`
    width: 327px;
    height: 80vh;
    position: absolute;
    border-style: ridge;
    background: lavenderblush;
`;
//Style css custome
const ContentStyled = styled.div`
    height: calc(100% - 56px);
    display: flex;
    flex-direction: column;
    padding: 11px;
    justify-content: flex-end;
`;
//Style css custome
const FormStyled = styled(Form)`
    display: inline-flex;
    justify-content: space-between;
    margin-bottom: 15px;
    align-items: center;
    padding: 2px 2px 2px 0;
    border: 1px solid rgb(230, 230, 230);
    border-radius: 2px;
    .ant-form-item {
        flex: 1;
        margin-bottom: 0;
    }
`;
//Style css custome
const MessageListStyled = styled.div`
    max-height: 100%;
    overflow-y: auto;

`;



export default function ChatWindow(){
    const {selectedRoom,members, setIsInviteMemberVisible} = useContext(AppContext);
    const {user : {
        uid, photoURL, displayName
    }} = useContext(AuthContext);
    const [inputValue, setInputValue] = useState('');
    const [form] = Form.useForm();

    //Chat content always bottom
    var messageBody = document.querySelector('.bodyContent');
    if(messageBody){
        messageBody.scrollTop = messageBody.scrollHeight - messageBody.clientHeight;
    }
    
    //auto hidden chat box
    const hiddenChatBox = () =>{
        document.getElementsByClassName("ChatWindow")[0].style.visibility = "hidden";
        document.getElementsByClassName("ChatFrame")[0].style.visibility = "visible";
    }

    //auto change value when typing
    const handleInputChange = (e) =>{
        document.body.style.overflow = "hidden";
        setInputValue(e.target.value);
        
    }
    //send data to firestore
    const handleOnSubmit = () =>{
        addDocument('messages', {
            text: inputValue,
            uid,
            photoURL,
            roomId: selectedRoom.id,
            displayName,
        })
        form.resetFields(['messages']);
    };

    //message conditoion
    const messCondition = useMemo(() => ({
        fieldName: 'roomId',
        operator: '==',
        compareValue: selectedRoom.id
    }),[selectedRoom.id])
    const messages = useFirestore('messages',messCondition);

    return <div>
        <WrapperStyled>
            {
                selectedRoom.id ? (
                    <>
                        <div className='center' onClick={hiddenChatBox} style={{position:"absolute", left:"45%"}}>
                            <Button icon ={<DownOutlined/>} type='text' className='btn-primary' style={{}} ></Button>
                        </div>
                        <HeaderStyled>
                            <div className='header_info'>
                                <h6 className='header_title'>{selectedRoom.name}</h6>
                                <cite className='header_description'>{selectedRoom.description}</cite>
                            </div>
                            
                            <ButtonGroupStyled>
                                <Button icon ={<UserAddOutlined/>} type='text' className='btn-primary' onClick={()=> setIsInviteMemberVisible(true)}> Invite </Button>
                                <Avatar.Group size='small' maxCount={2}>
                                    {members.map((member) => (
                                    <Tooltip title={member.displayName} key={member.id}>
                                        <Avatar src={member.photoURL}>
                                        {member.photoURL
                                            ? ''
                                            : member.displayName?.charAt(0)?.toUpperCase()}
                                        </Avatar>
                                    </Tooltip>
                                    ))}
                                </Avatar.Group>
                            </ButtonGroupStyled>
                        </HeaderStyled>
                        <ContentStyled>
                            <MessageListStyled className='bodyContent'>
                                {
                                    messages.map(mes => 
                                        <Message 
                                            key={mes.id}
                                            text={mes.text}
                                            photoURL={mes.photoURL}
                                            displayName={mes.displayName}
                                            createdAt={mes.createdAt} 
                                        />
                                    )
                                }
                            </MessageListStyled>
                            <FormStyled form={form}>
                                <Form.Item name={"messages"}>
                                    <Input
                                        onChange={handleInputChange}
                                        onPressEnter={handleOnSubmit}
                                        placeholder='Input message' 
                                        bordered={false} 
                                        autoComplete="off"
                                    />
                                </Form.Item>
                                <Button type="primary" onClick={handleOnSubmit}>Send</Button>
                            </FormStyled>
                        </ContentStyled>
                    </>
                ) : <Alert 
                        message="Create or Choose a room, please!" 
                        type="info" 
                        showIcon 
                        style={{margin: 5}} 
                        closable 
                    />
            }
        </WrapperStyled>
    </div>;
}