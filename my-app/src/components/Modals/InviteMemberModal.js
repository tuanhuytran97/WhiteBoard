import React, { useContext, useState } from 'react'
import {Alert, Button, Form, Input, Modal, Select, Spin} from 'antd'
import { AppContext } from '../Context/AppProvider';
import { AuthContext } from '../Context/AuthProvider';
import { debounce } from '@mui/material';
import Avatar from 'antd/lib/avatar/avatar';
import { db } from '../firebase/config';


function DebounceSelect({fetchOptions, debounceTimeout = 300, ...props}){
    const [fetching,setFetching] = useState(false);
    const [options, setOptions] = useState([]);
    
    //use for onSearch
    const debounceFetcher = React.useMemo(() => {
        const loadOptions = (value) => {
            setOptions([]);
            setFetching(true);

            fetchOptions(value, props.curMembers).then(newOptions => {
                setOptions(newOptions);
                setFetching(false);
            })
        }
        return debounce(loadOptions,debounceTimeout)
    }, [debounceTimeout,fetchOptions])

    return (
        <Select
            labelInValue
            filterOption={false}
            onSearch={debounceFetcher}
            notFoundContent={fetching ? <Spin size="small"/> : null}
            {...props}
        >
            {options?.map?.((opt) => (
                <Select.Option key={opt.value} value={opt.value} title={opt.label}>
                    <Avatar size='small' src={opt.photoURL}>
                        {opt.photoURL ? '' : opt.label?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    {` ${opt.label}`}
                </Select.Option>
            ))}
        </Select>
    )
}

async function fetchUserList(search, curMembers){
        return db
        .collection('users')
        .where('keywords', 'array-contains', search?.toLowerCase())
        .orderBy('displayName')
        .limit(20)
        .get()
        .then((snapshot) => {
        return snapshot.docs
            .map((doc) => ({
            label: doc.data().displayName,
            value: doc.data().uid,
            photoURL: doc.data().photoURL,
            }))
            .filter((opt) => !opt.value.includes(curMembers));
        });
}


   

export default function InviteMemberModal(){
    const {isInviteMemberVisible,setIsInviteMemberVisible, selectedRoomId,selectedRoom} = useContext(AppContext);
    const {user: {uid}} = useContext(AuthContext);
    const [value, setValue] = useState([]);
    const [form] = Form.useForm();
    
    const handleOk = () => {
        try{
            form.resetFields();
            // update members in current room
            const roomRef = db.collection('rooms').doc(selectedRoomId);
            roomRef.update({
                members: [...selectedRoom.members, ...value.map((val) => val.value)],
            });
            
            setValue([]);
            setIsInviteMemberVisible(false);
        }catch{
            alert("Please join a room!");
        }
        
    }
    const copyURL = () => {
        const text = document.getElementById("myURL");
        text.select();
        navigator.clipboard.writeText(text.value);
    }
    const handleCancel = () => {
        setIsInviteMemberVisible(false);
    }


    return (
        <div>
            <Modal
                title="Add Members"
                visible={isInviteMemberVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form layout="vertical">
                    <p>Share this link with anyone: </p>
                    <Input type="text" value={window.location.href} id="myURL" style={{maxWidth:"79%",marginRight:"5px"}} readOnly />
                    <Button onClick={copyURL}>Copy</Button>
                </Form>
                <Form form={form} layout="vertical" style={{marginTop:"20px"}}>
                    <p>Invite members with Display name: </p>
                    <DebounceSelect
                        mode="multiple"
                        label="Name of members"
                        value={value}
                        placeholder = "Type name of member"
                        fetchOptions={fetchUserList}
                        onChange={newValue => setValue(newValue)}
                        style={{width: '100%'}}
                        curMembers={selectedRoom.members}
                    >

                    </DebounceSelect>
                </Form>
            </Modal>
        </div>
    )
}