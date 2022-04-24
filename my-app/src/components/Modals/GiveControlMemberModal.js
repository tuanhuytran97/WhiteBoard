import React, { useContext, useState } from 'react'
import { Form, Modal, Select, Spin} from 'antd'
import { AppContext } from '../Context/AppProvider';
import { AuthContext } from '../Context/AuthProvider';
import { debounce } from '@mui/material';
import Avatar from 'antd/lib/avatar/avatar';
import { db } from '../firebase/config';


function DebounceSelect({fetchOptions, debounceTimeout = 300, ...props}){


    const [fetching,setFetching] = useState(false);
    const [options, setOptions] = useState([]);
    
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
            // .filter((opt) => curMembers.includes(opt.value));
        });
}


   

export default function GiveControlMemberModal(){
    const {isGiveControlMemberVisible,setIsGiveControlMemberVisible, selectedRoomId,selectedRoom} = useContext(AppContext);
    const {user: {uid}} = useContext(AuthContext);
    const [value, setValue] = useState([]);
    const [form] = Form.useForm();
    const handleOk = () => {
        try{
            form.resetFields();
            const roomRef = db.collection('rooms').doc(selectedRoomId);
            // update members in current room
            roomRef.update({
                control: [...value.map((val) => val.value)],
            });
            
            setValue([]);
            setIsGiveControlMemberVisible(false);
        }catch{
            alert("Please join a room!");
        }
        
    }

    const handleCancel = () => {
        setIsGiveControlMemberVisible(false);
    }

    return (
        <div>
            <Modal
                title="Give Control for Members"
                visible={isGiveControlMemberVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <p>Choose your members which will controll: </p>
                    <DebounceSelect
                        mode="multiple"
                        label="Name of members"
                        value={value}
                        placeholder = "Type name of member"
                        fetchOptions={fetchUserList}
                        onChange={newValue => setValue(newValue)}
                        style={{width: '100%'}}
                        curMembers={selectedRoom.members}
                        controlMembers = {selectedRoom.controls}
                    >

                    </DebounceSelect>
                </Form>
            </Modal>
        </div>
    )
}