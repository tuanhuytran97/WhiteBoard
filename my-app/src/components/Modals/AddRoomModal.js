import React, { useContext } from 'react'
import {Form, Modal, Input} from 'antd'
import { AppContext } from '../Context/AppProvider';
import { addDocument } from '../firebase/service';
import { AuthContext } from '../Context/AuthProvider';

export default function AddRoomModal(){
    const {isAddRoomVisible,setIsAddRoomVisible} = useContext(AppContext);
    const {user: {uid}} = useContext(AuthContext);
    const [form] = Form.useForm();
    const handleOk = () => {
        //add new room to firestore
        //console.log({ formData: form.getFieldValue() });
        addDocument('rooms', {...form.getFieldValue(), members: [uid], control: [uid]})

        //reset form
        form.resetFields();
        setIsAddRoomVisible(false);
    }

    const handleCancel = () => {
        setIsAddRoomVisible(false);
    }

    return (
        <div>
            <Modal
                title="Create room"
                visible={isAddRoomVisible}
                onOk={handleOk}
                onCancel={handleCancel}
            >
                <Form form={form} layout="vertical">
                    <Form.Item label="Room Name" name='name'>
                        <Input placeholder="Type name of room"/>
                    </Form.Item>
                    <Form.Item label="Description" name='description'>
                        <Input.TextArea placeholder="Type description of room"/>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}