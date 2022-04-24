import React, { useState, useEffect, useContext, useMemo} from 'react'
import './Interface.css'
import StrokeColor from '../Options/StrokeColor';
import PickSize from '../Options/PickSize';
import FillStyle from '../Options/FillStyle';
import Fill from '../Options/Fill';
import FontSize from '../Options/FontSize';
import Delete from '../Actions/Delete';
import PencelSize from '../Options/PencilSize';

//ICON
import circleIcon from '../picture/circle.png';
import cursorIcon from '../picture/cursor.png'
import pictureIcon from '../picture/picture.png'
import selectionIcon from '../picture/move.png';
import lineIcon from '../picture/line.png';
import rectangleIcon from '../picture/rectangle.png';
import resetIcon from '../picture/reset.png';
import loadIcon from '../picture/load.png';
import exportIcon from '../picture/export.png';
import inviteIcon from '../picture/invite.png';
import pencilIcon from '../picture/pencil.png';
import lock from '../picture/lock.png';
import open from '../picture/open.png';
import textIcon from '../picture/text.png'
import chatIcon from '../picture/chat.png'
import { BoardContext } from '../Board';
import Sidebar from '../../Communicate/Sidebar';
import styled from 'styled-components';
import { Button, Tooltip, Avatar, Form, Input, Alert, Upload } from 'antd';
import { AppContext } from '../../Context/AppProvider';
import { AuthContext } from '../../Context/AuthProvider';
import { addDocument, DeleteDocument } from '../../firebase/service';
import useFirestore from '../../hooks/useFirestore';
import ChatWindow from '../../Communicate/ChatWindow';
import firebase,{ db } from '../../firebase/config';
import { createElement, getBase64 } from '../BoardLibrary';
import FontFamily from '../Options/FontFamily';
import BringToFront from '../Actions/BringToFront';
import BringToBack from '../Actions/BringToBack';

const ButtonGroupStyled = styled.div`
    display: flex;
    align-items: center;
`;

export default function TopHeader() {
    const {selectedRoom,members, setIsInviteMemberVisible,setIsGiveControlMemberVisible,selectedRoomId} = useContext(AppContext);
    const [options,setOptions] = useState("");
    const isMobile = false;
    const {
        tool,setTool,setElements,selected,permission,elements,canvasRef,setImgSrc,drawImageToCanvas
    } = React.useContext(BoardContext);

    //const ariaRef = document.querySelector('.ant-collapse-header').ariaExpanded;

    useEffect(() => {
        if (options === "reset"){
            const context= canvasRef.current.getContext('2d');
            context.setTransform(1,0,0,1,0,0);
            drawImageToCanvas();
            setOptions("");
        }
        
            
    }, [options])
    const handleRequestControl = () =>{
        alert("Don't have permission!!!")
    }
    const handleGiveControl = () =>{
        setIsGiveControlMemberVisible(true);
    }
    const permissionOpen = () =>{
        return (
            <div className='PermissionOpen'>
                <label  title='Click to give permission'>
                        <input aria-label="Chat" type="radio"  checked={options === "PermissionOpen"} onClick={handleGiveControl}/> 
                            <img 
                                alt="chat" 
                                src={open}
                                width="20px"
                                height="20px"
                            />
                </label>    
            </div>
        )
    }
    const permissionLock = () =>{
        return (
            <div className='PermissionLock'>
                <label  title='No permission to control'>
                        <input aria-label="Chat" type="radio"  checked={options === "PermissionLock"}  onClick={handleRequestControl}/> 
                            <img 
                                alt="chat" 
                                src={lock}
                                width="20px"
                                height="20px"
                            />
                </label> 
            </div>
        )
    }
    const permissionControl = () => {
        if(permission === true){
            document.getElementsByClassName("FrameTopBoard")[0].style.visibility = "visible";
            document.getElementsByClassName("undo-redo-clear")[0].style.visibility = "visible";
            document.getElementsByClassName("Options")[0].style.visibility = "visible";
            document.getElementsByClassName("Actions")[0].style.visibility = "visible";
        }else{
            document.getElementsByClassName("FrameTopBoard")[0].style.visibility = "hidden";
            document.getElementsByClassName("undo-redo-clear")[0].style.visibility = "hidden";
            document.getElementsByClassName("Options")[0].style.visibility = "hidden";
            document.getElementsByClassName("Actions")[0].style.visibility = "hidden";
        }
    }

    useEffect(() => {
        permissionControl();
    }, [permission])

    

    const handleShowChat = () => {
        const ChatWindowRef = document.querySelector('.ChatWindow');
        const ChatWindowStyled = getComputedStyle(ChatWindowRef).visibility;
        const ariaRef = document.querySelector('.ant-collapse-header');
        ariaRef.ariaExpanded = "false";
        if(ChatWindowStyled==="hidden"){
            document.getElementsByClassName("ChatWindow")[0].style.visibility = "visible";
            document.getElementsByClassName("ChatFrame")[0].style.visibility = "hidden";
            setOptions("");
        }else{
            document.getElementsByClassName("ChatWindow")[0].style.visibility = "hidden";
            setOptions("");
        }
    }

    //Header style
    const onInviteMembers = () =>{
        if(selectedRoomId){
            setIsInviteMemberVisible(true);
        }else{
            alert("Please choose a room !!!")
        }
        
    }
    const option = () => {

        switch(tool) {

            case "line":    return (
                                <>
                                    <StrokeColor/>
                                    <PickSize />
                                    
                                </>
                            );
            case "rectangle":  return (
                                <>
                                    <StrokeColor />
                                    <Fill/>
                                    <PickSize />
                                    <FillStyle/>
                                </>);
            case "circle":  return (
                                <>
                                    <StrokeColor />
                                    <Fill/>
                                    <PickSize />
                                    <FillStyle/>
                                </>);
            case "pencil":  return (
                                <>
                                    <PencelSize/>
                                    <Fill/>
                                </>);
            case "text":  return (
                <>
                                    <Fill/>
                                    <FontSize/>
                                    <FontFamily/>
                </>);
            case "selection":
                if(selected){
                    //console.log(selected);
                    if(selected.type === "rectangle" || selected.type === "circle"){
                        return (
                        
                            <>
                                <StrokeColor />
                                <Fill/>
                                <PickSize />
                                <FillStyle/>
                            </>);
                    }else if(selected.type ==="line"){
                        return (
                        
                            <>
                                <StrokeColor/>
                                
                                <PickSize />
                            
                            </>);
                    }else  if(selected.type ==="pencil"){
                        return (
                            <> 
                                <PencelSize />
                                <Fill/>
                            </>);
                    }else if(selected.type === "text"){
                        return (
                            <> 
                                <Fill/>
                                <FontSize/>
                                <FontFamily/>
                            </>);
                    }
                }
        
            
            
            default:      return 
        }
    }
    const action = () => {
        if(tool === "selection" && selected){
            return (
                <div className='row'>
                    <Delete/>
                    <BringToFront/>
                    <BringToBack/>
                </div>);
        }else{
            return
        }
        // switch(tool) {
        //     case "selection":  
        // default:      return 
        // }
    }

    
    const {user : {
        uid, photoURL, displayName
    }} = useContext(AuthContext);
    const [inputValue, setInputValue] = useState('');
    const [form] = Form.useForm();

    //khi nhập bàn phím value sự tự động nhận
    const handleInputChange = (e) =>{
        setInputValue(e.target.value);
    }
    //khi nhấn submit value đc gửi lên db
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

    //lấy mess
    const messCondition = useMemo(() => ({
        fieldName: 'roomId',
        operator: '==',
        compareValue: selectedRoom.id
    }),[selectedRoom.id])
    const messages = useFirestore('messages',messCondition);

    //console.log({members});

    const storeLocal = async(file) => {
        if(file){
            //const storageRef = firebase.storage().ref(`${selectedRoomId}`);
            //luu vao muc chung cho do ton dung luong
            const storageRef = firebase.storage().ref();
            const fileRef = storageRef.child(file.name);
            await fileRef.put(file).then(()=>{
                console.log("File Uploaded ", file.name );
            })
            const src = {
                name: file.name,
                address: await fileRef.getDownloadURL()
            }
            setImgSrc(src) ;
            
            
            //localStorage.setItem(`${file.name}`,reader.result);
            
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = ()  =>{
                //console.log(reader.result);
                localStorage.setItem(`${file.name}`,reader.result);
            };
            alert("Image Load success,Click and Drag to Draw image!!!");
            setTool("picture");
        }
        
    }
    const handlePicture = async (e) => {
        const canvas = document.getElementById('canvas');
        canvas.style.cursor = 'wait';
        var file = e.target.files[0];
        await storeLocal(file);
        canvas.style.cursor = 'default';
    }

    const handleExport = async(e) => {
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
            alert("Mobile not support for export and import JSON");
            return;
        }
        setOptions("");
        const content = JSON.stringify(elements);
        const uriContent = "data:application/octet-stream," + encodeURIComponent(content);
        const newWindow = window.open(uriContent, 'Save File');
        setTimeout(function () {
            //FireFox seems to require a setTimeout for this to work.
            var a = document.createElement("a");
            a.href = window.URL.createObjectURL(new Blob([content], { type: "text/json" }));
            a.download = "whiteboard.json";
            newWindow.document.body.appendChild(a);
            a.click();
            newWindow.document.body.removeChild(a);
            setTimeout(function () {
                newWindow.close();
            }, 100);
        }, 0);
    }

    function readFileAsync(file) {
        return new Promise((resolve, reject) => {
          let reader = new FileReader();
      
          reader.onload = () => {
            resolve(reader.result);
          };
      
          reader.onerror = reject;
          reader.readAsText(file);
        })
    }
    const handleLoadFile = async (e) => {
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
            alert("Mobile not support for export and import JSON");
            return;
        }

        
        if(permission === true){
            try {
                debugger;
                let file = e.target.files[0];
                let content = await readFileAsync(file);
                let id = elements.length;
                const elementsRef = JSON.parse(content);
                const elementsCopy = [...elements];
                elementsRef.forEach((element) => {
                    const {x1,y1,x2,y2,type,options,src} = element;
                    const e = createElement(id,x1,y1,x2, y2, type,options,src);
                    elementsCopy[id] = e;
                    id = id + 1;
                })
                setElements(elementsCopy);
                setTool("cursor");
                const fileRef = document.getElementById("load");
                fileRef.value = null;
            } catch(err) {
            alert(err);
            }
        }else{
            const fileRef = document.getElementById("load");
            fileRef.value = null;
            alert("No permission!");
        }
        
    }
    return (
        
        <>
            
                    <div className="LeftSide">
                        <div className="FrameLeftSide border">
                            <div className="communicate row">
                                
                                <label  title='Reset Zoom'>
                                    <input aria-label="Reset" type="radio" id="reset" checked={options === "reset"} onChange={()=> setOptions("reset")}/> 
                                        <img 
                                            alt="reset" 
                                            src={resetIcon}
                                            width="20px"
                                            height="20px"
                                        />
                                </label>

                                <label  title='Load JSON text File'>
                                    <input aria-label="Load" type="file" id="load" checked={options === "load"} onChange= {handleLoadFile} style={{display:"none"}} /> 
                                        <img 
                                            alt="load" 
                                            src={loadIcon}
                                            width="20px"
                                            height="20px"
                                        />
                                </label>

                                    <label title='Export JSON text file'>
                                        <input aria-label="Export" type="radio" id="export" checked={options === "export"} onClick= {handleExport}/> 
                                            <img 
                                                alt="export" 
                                                src={exportIcon}
                                                width="20px"
                                                height="20px"
                                            />
                                    </label>

                                    <div style={{display: "flex",flex:"1"}}>
                                        {
                                            permission === true? 
                                            permissionOpen():
                                            permissionLock()            
                                        }
                                    </div>

                                    <ButtonGroupStyled>
                                        <label id = "inviteMembers"  title='Invite Members'>
                                            <input aria-label="Invite" 
                                                type="radio" id="invite" 
                                                checked={options === "invite"} 
                                                onChange= {()=> setOptions("")}
                                                onClick={onInviteMembers}
                                            /> 
                                                <img 
                                                    alt="invite" 
                                                    src={inviteIcon}
                                                    width="20px"
                                                    height="20px"
                                                />
                                        </label>
                                        
                                    </ButtonGroupStyled>

                                    
                            </div>
                            
                        </div>
                        <div className="Options border" >
                            <div className="FrameOptions">
                                    {option()}
                            </div>
                        </div>
                        <div className="Actions border" >
                            <div className="FrameActions">
                                    {action()}
                            </div>
                        </div>
                    </div>
                
                    <div className="TopBoard">
                        <div className="FrameTopBoard row">
                            <label  title='Observation'>
                                <input aria-label="cursor" type="radio" id="cursor" checked={tool === "cursor"} onChange= {()=> setTool("cursor")} /> 
                                <img 
                                    alt="cursor" 
                                    src={cursorIcon}
                                    width="20px"
                                    height="20px"
                                />
                            </label>
                            <label  title='Selection'>
                                <input aria-label="Selection" type="radio" id="selection" checked={tool === "selection"} onChange= {()=> setTool("selection")} /> 
                                <img 
                                    alt="selection" 
                                    src={selectionIcon}
                                    width="20px"
                                    height="20px"
                                />
                            </label>
                            <label  title='Draw Line'>
                                <input aria-label="Line" type="radio" id="line" checked={tool === "line"} onChange= {()=> setTool("line")} /> 
                                <img 
                                    alt="line" 
                                    src={lineIcon}
                                    width="20px"
                                    height="20px"
                                />
                            </label>
                            
                            <label  title='Draw Rectangle'>
                                <input aria-label="Rectangle" type="radio" id="rectangle" checked={tool === "rectangle"} onChange= {()=> setTool("rectangle")}/> 
                                <img 
                                    alt="rectangle" 
                                    src={rectangleIcon}
                                    width="20px"
                                    height="20px"
                                />
                            </label>

                            <label  title='Draw Circle' style={{marginLeft:'3px'}}>
                                <input aria-label="Circle" type="radio" id="circle" checked={tool === "circle"} onChange= {()=> setTool("circle")}/> 
                                <img 
                                    alt="circle" 
                                    src={circleIcon}
                                    width="20px"
                                    height="20px"
                                />
                            </label>

                            <label  title='Use pencil'>
                                <input type="radio" id="pencil" checked={tool === "pencil"} onChange= {()=> setTool("pencil")}/> 
                                <img 
                                    alt="pencil" 
                                    src={pencilIcon}
                                    width="20px"
                                    height="20px"
                                />
                            </label>

                            <label  title='Writing a text'>
                                <input type="radio" id="text" checked={tool === "text"} onChange= {()=> setTool("text")}/> 
                                <img 
                                    alt="text" 
                                    src={textIcon}
                                    width="20px"
                                    height="20px"
                                />
                            </label>
                            <label  title='Add a image'>
                                <input type="file" id="picture" checked={tool === "picture"} onChange= {handlePicture} 
                                style={{
                                    visibility: "hidden",
                                    position: "absolute"
                                }}
                                /> 
                                <img 
                                    alt="picture" 
                                    src={pictureIcon}
                                    width="20px"
                                    height="20px"
                                    checked={tool === "picture"}
                                />
                                {/* <Upload id='picture' onChange={handlePicture}>
                                    <Button icon={<FileImageOutlined />} width="20px" height="20px"></Button>
                                </Upload> */}
                            </label>
                        </div>
                        
                    </div>
                
                
                <div className="RightSide">
                    <Sidebar></Sidebar>
                    
                </div>

                <div className='IconMembers'>
                    {/* <p className='headerStyle'>{selectedRoom.name}</p> */}
                    <Avatar.Group className='meme' size='medium' maxCount={2}>
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
                </div>

                <div className="ChatWindow">
                    
                    
                    
                    <ChatWindow/>
                    
                </div>
                
                <div className='ChatFrame'  style={{position: "absolute", bottom:"30px",right:"10px",display:"none"}}> 
                    <label  title='Chat Box'>
                        <input aria-label="Chat" type="radio"  checked={options === "chat"}  onClick={handleShowChat}/> 
                            <img 
                                id="chat"
                                alt="chat" 
                                src={chatIcon}
                                width="20px"
                                height="20px"
                            />
                    </label>
                </div>
            
        </>
        


        
        
        

        
    )
}
