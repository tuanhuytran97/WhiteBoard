import React, {useLayoutEffect,useState,useEffect,useRef, useContext} from 'react';
import rough from 'roughjs/bundled/rough.esm';
import Interface from './BoardComponents/Interface';
import {getStroke} from "perfect-freehand";
import 'antd/dist/antd.css';
import { AppContext } from '../Context/AppProvider';
import { AuthContext } from '../Context/AuthProvider';
import Clear from './Actions/Clear';
import firebase from 'firebase/app';
import { db } from '../firebase/config';
import { adjustElementCoordinates, useHistory, getElementAtPosition, 
    cursorForPosition, resizedCoordinates, createElement, 
    getSvgPathFromStroke, adjustmentRequired} from './BoardLibrary';
import {  useSearchParams } from 'react-router-dom';
import { useGetData } from '../firebase/service';

//where to save the board's data
export const BoardContext = React.createContext();

//Check permission to control whiteboard
const usePermission = (membersList, uid) => {
    const [permission, setPermisstion] = useState(false);
    useEffect(() => {
        let count = 0;
        membersList.forEach((e) => {
            if(e.uid == uid){
                count += 1;
            }
        })
        if(count !== 0){
            setPermisstion(true);
        }else{
            setPermisstion(false);
        }
    },[membersList,uid])
    return permission;
};

export default function Board({children}) {
    const {user : {
        uid
    }} = useContext(AuthContext);
    const {selectedRoomId,Membercontrols,setSelectedRoomId} = useContext(AppContext);
    const [tool,setTool] = useState("cursor");
    const initData = useGetData(selectedRoomId);
    const [elements, setElements, undo, redo] = useHistory(initData);
    const [action, setAction] = useState("none");
    const [selectedElement, setSelectedElement] = useState(null);
    const [selected, setSelected] = useState(null);
    const permission = usePermission(Membercontrols,uid);
    const textAreaRef = useRef();
    const [searchParams,setSearchParams] = useSearchParams();
    //const [zoom, setZoom] = useState(1);
    const canvasRef = useRef(null);
    const [imgSrc,setImgSrc] = useState(null);
    //const [currentTransformedCursor,setCurrentTransformedCursor] = useState({x: 0, y: 0}); 
    const [dragStartPosition,setDragStartPosition] = useState({x:0,y:0});
    const [options,setOptions] = useState({
        fillStyle:"solid",
        fill: "#D400FF",
        stroke: "black",
        strokeWidth: "3",
        roughness : 0,
        text: "",
        penFillStyle: "#D400FF",
        fontSize: "20px",
        fontFamily: "serif",
        size: 5,
        thinning: 0.5,
        smoothing: 0.5,
        streamline: 0.5,
        easing: (t) => t,
        start: {
            taper: 0,
            easing: (t) => t,
            cap: true
        },
        end: {
            taper: 100,
            easing: (t) => t,
            cap: true
        }
        
        
    })

    function toDataURL(url, callback) {
        var xhr = new XMLHttpRequest();
        xhr.onload = function() {
          var reader = new FileReader();
          reader.onloadend = function() {
            callback(reader.result);
          }
          reader.readAsDataURL(xhr.response);
        };
        xhr.open('GET', url);
        xhr.responseType = 'blob';
        xhr.send();
    }
    const drawImageToCanvas = async () =>{
        const context = canvasRef.current.getContext('2d');
        
        //console.log({currentTransformedCursor});
        context.save();
        context.setTransform(1,0,0,1,0,0);
        context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        context.restore();
        const roughCanvas = rough.canvas(canvasRef.current);

        elements.forEach(element => {
            if (action === "writing" && selectedElement.id === element.id) return;
            if(element.isDeleted === false){
                drawElement(roughCanvas, context, element);
            }
        });
       
        
    }
    
    //listen for searchParam's change event
    useEffect(() => {
        const u = searchParams.get("room") ;
        if(u){
            const roomId = atob(u).toString();
            if(roomId){
                db.collection("rooms").doc(String(roomId)).get().then(element => {
                    const allMember = element.data().members;
                    if(!allMember.includes(String(uid))){
                        const roomRef = db.collection('rooms').doc(roomId);
                        //update members in current room
                        roomRef.update({
                            members: firebase.firestore.FieldValue.arrayUnion(String(uid)),
                        });
                    }
                })
                setSelectedRoomId(roomId);
            }
        }
    },[searchParams]);
    //listen for change event from firestore and update for client
    useEffect(()=>{
        if(selectedRoomId){
            const unsubscribe = db.collection('boards').doc(String(selectedRoomId)).onSnapshot((doc) => {
                if(doc.data()){
                    const data = JSON.parse(doc.data().elements);
                    var source = doc.metadata.hasPendingWrites ? "Local" : "Server";
                    if(source ==="Server"){
                        //compare data vs elements, if element difference with data => setElements
                        if(permission === false){
                            if(JSON.stringify(data) !== JSON.stringify(elements)){
                                setElements([...data]);
                            }
                           
                        }
                    }
                }
                
            })
            return () => unsubscribe();
        }
    })
    //update data to firestore
    useLayoutEffect(() => {
        if(selectedRoomId && action==="none" && permission){
                db.collection("boards").doc(String(selectedRoomId)).set({elements: JSON.stringify(elements)}) 
        }
        if(action !== "dragging"){
            drawImageToCanvas();
        }
    }, [elements,options]);
    

    
    //Undo and redo event
    useEffect(() => {
        const undoRedoFunction = event => {
        if ((event.metaKey || event.ctrlKey) && event.key === "z") {
            if (event.shiftKey) {
                redo();
            }else {
                undo();
            }
            }
        };
        document.addEventListener("keydown", undoRedoFunction);
        return () => {
        document.removeEventListener("keydown", undoRedoFunction);
        };
    }, [undo, redo]);

    //listen from tools
    useLayoutEffect(() => {
        if(tool !== "selection"){
            setSelected(null);
            canvasRef.current.style.cursor = "default";
        }
    }, [tool]);
    
    //Create area to writting text
    useEffect(() => {
        const textArea = textAreaRef.current;
        if (action === "writing") {
            textArea.focus();
            textArea.value = selectedElement.options.text;
        }
    }, [action, selectedElement]);
    
    //Update element function
    const updateElement = (id, x1, y1, x2, y2, type, options,src) => {
        const elementsCopy = [...elements];
        switch (type) {
            case "line":
            case "rectangle":
                elementsCopy[id] = createElement(id, x1, y1, x2, y2, type, options);
                break;
            case "circle":
                elementsCopy[id] = createElement(id, x1, y1, x2, y2, type, options);
                break;
            case "pencil":
                elementsCopy[id].points = [...elementsCopy[id].points, { x: x2, y: y2 }];
                break;
            case "text":
                const textWidth = document
                .getElementById("canvas")
                .getContext("2d")
                .measureText(options.text).width;
                const textHeight = 24;
                elementsCopy[id] = {
                    ...createElement(id, x1, y1, x1 + textWidth, y1 + textHeight, type, options)
                };
                break;
            case "picture":
                elementsCopy[id] = createElement(id, x1, y1, x2, y2, type, options,src);
                break;
            default:
                throw new Error(`Type not recognised: ${type}`);
        }
    
        setElements(elementsCopy, true);
    };

    //Draw Element function
    const drawElement = async(roughCanvas, context, element) => {
        let {x1,y1,x2,y2,options,src} = element;
        switch (element.type) {
            case "line":
                roughCanvas.line(x1,y1,x2,y2,options);
                break;
            case "rectangle":
                roughCanvas.rectangle(x1,y1,x2-x1,y2-y1,options);
                break;
            case "circle":
                const diameter = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2,2));
                roughCanvas.circle(x1,y1,diameter,options);
                break;
            case "pencil":
                context.beginPath();
                context.fillStyle =options.penFillStyle;
                const stroke = getSvgPathFromStroke(getStroke(element.points,options));
                context.fill(new Path2D(stroke));
                break;
            case "text":
                context.beginPath();
                context.textBaseline = "top";
                context.fillStyle = options.penFillStyle;
                context.font =  options.fontSize + ' ' + options.fontFamily ;
                context.fillText(options.text, element.x1, element.y1);
                break;
            case "picture":
                if(src){
                    const image = new Image();
                    if(localStorage.getItem(`${src.name}`) === null){
                        toDataURL(src.address, function(dataUrl) {
                            localStorage.setItem(`${src.name}`,dataUrl);
                        }) 
                    }
                    image.src = localStorage.getItem(`${src.name}`);
                    context.drawImage(image, x1,y1,x2-x1,y2-y1);
                }   
            default:
        }
    }; 

    //Handle event when mouse down
    const handleMouseDown = (event) =>{
        if (action === "writing") return;
        let {clientX, clientY} = event;
        const transformedCursorPosition = getTransformedPoint(clientX, clientY);
        clientX = transformedCursorPosition.x;
        clientY = transformedCursorPosition.y;
        if(tool === "selection"){
            const element = getElementAtPosition(clientX, clientY,elements);
            if(element && element.isDeleted === false){
                
                if (element.type === "pencil") {
                    const xOffsets = element.points.map(point => clientX - point.x);
                    const yOffsets = element.points.map(point => clientY - point.y);
                    setSelectedElement({ ...element, xOffsets, yOffsets });
                } else {
                    const offsetX = clientX - element.x1;
                    const offsetY = clientY - element.y1;
                    setSelectedElement({...element,offsetX,offsetY});
                }
                setSelected(element);
                setElements(prevState => prevState);
                
                if(element.position === "inside"){
                    setAction("moving");
                }else{
                    setAction("resizing");
                }
            }   
        }else if(tool ==="cursor"){
            setAction("dragging");
            setDragStartPosition({x: clientX,y :clientY});
        }

        else{
            const id = elements.length;
            
            let element = createElement(id,clientX,clientY,clientX, clientY, tool,options);
            if(tool==="picture"){
                element = createElement(id,clientX,clientY,clientX, clientY, tool,options,imgSrc);
            }
            setElements(prevState => [...prevState,element]);
            setSelectedElement(element);
            setAction(tool === "text" ? "writing" : "drawing");
        }
    }
    //Handle event when mouse move
    const handleMouseMove = (event) => {
        let { clientX, clientY } = event;
        const transformedCursorPosition = getTransformedPoint(clientX, clientY);
        clientX = transformedCursorPosition.x;
        clientY = transformedCursorPosition.y;
        //console.log(clientX ," : " , transformedCursorPosition.x);
        if (tool === "selection") {
            const element = getElementAtPosition(clientX, clientY, elements);
            event.target.style.cursor = element? cursorForPosition(element.position) : "default";
        }
    
        if (action === "drawing") {
            const index = elements.length - 1;
            const { x1, y1, options,src } = elements[index];
            updateElement(index, x1, y1, clientX, clientY, tool, options,src);
        } else if (action === "moving") {
            if (selectedElement.type === "pencil") {
                const newPoints = selectedElement.points.map((_, index) => ({
                    x: clientX - selectedElement.xOffsets[index],
                    y: clientY - selectedElement.yOffsets[index],
                }));
                const elementsCopy = [...elements];
                elementsCopy[selectedElement.id] = {
                    ...elementsCopy[selectedElement.id],
                    points: newPoints,
                };
                setSelected(elementsCopy[selectedElement.id]);
                setElements(elementsCopy, true);
            
            }else{
                //Line & rec
                const { id, x1, x2, y1, y2, type, offsetX, offsetY, options,src } = selectedElement;
                const width = x2 - x1;
                const height = y2 - y1;
                const newX1 = clientX - offsetX;
                const newY1 = clientY - offsetY;

                updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type, options,src);
                setSelected(elements[id]);
            }
        } else if (action === "resizing") {
            const { id, type, position, options,src, ...coordinates } = selectedElement;
            const { x1, y1, x2, y2 } = resizedCoordinates(clientX, clientY, position, coordinates);
            updateElement(id, x1, y1, x2, y2, type, options,src);
        }
        if(tool === "cursor"){
            if(action ==="dragging"){
                {   
                    const currentTransformedCursor = getTransformedPoint(event.clientX,event.clientY);
                    const context = canvasRef.current.getContext('2d');
                    context.translate(currentTransformedCursor.x - dragStartPosition.x, currentTransformedCursor.y - dragStartPosition.y);
                    drawImageToCanvas();
                }
            }
        } 
    };
    //Handle event when mouse up
    const handleMouseUp = async (event) => {
        let { clientX, clientY } = event;
        const transformedCursorPosition = getTransformedPoint(clientX, clientY);
        clientX = transformedCursorPosition.x;
        clientY = transformedCursorPosition.y;
        if (selectedElement) {
            if (
                selectedElement.type === "text" &&
                clientX - selectedElement.offsetX === selectedElement.x1 &&
                clientY - selectedElement.offsetY === selectedElement.y1
            ) {
                setAction("writing");
                return;
            }
        
            const index = selectedElement.id;
            const { id, type,options,src } = elements[index];
            if ((action === "drawing" || action === "resizing" || action ==="moving") && adjustmentRequired(type)) {
                const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
                updateElement(id, x1, y1, x2, y2, type,options,src);
            }
        }
    
        if (action === "writing") return;

        //only for pencil
        if(selectedElement){
            if(selectedRoomId && (selectedElement.type === "pencil"|| selectedElement.type === "text" || selectedElement.type === "circle")){
                db.collection("boards").doc(String(selectedRoomId)).set({elements: JSON.stringify(elements)}) 
            }
        }
        setAction("none");
        setSelectedElement(null);
    };

    //Handle event when mobile touch
    const handleTouchStart = (event) =>{
        if (action === "writing") return;
        let {clientX, clientY} = event.changedTouches[0];
        const transformedCursorPosition = getTransformedPoint(clientX, clientY);
        clientX = transformedCursorPosition.x;
        clientY = transformedCursorPosition.y;
        if(tool === "selection"){
            const element = getElementAtPosition(clientX, clientY,elements);
            if(element && element.isDeleted === false){
                
                if (element.type === "pencil") {
                    const xOffsets = element.points.map(point => clientX - point.x);
                    const yOffsets = element.points.map(point => clientY - point.y);
                    setSelectedElement({ ...element, xOffsets, yOffsets });
                } else {
                    const offsetX = clientX - element.x1;
                    const offsetY = clientY - element.y1;
                    setSelectedElement({...element,offsetX,offsetY});
                }
                setSelected(element);
                setElements(prevState => prevState);
                
                if(element.position === "inside"){
                    setAction("moving");
                }else{
                    setAction("resizing");
                }
            }   
        }else if(tool ==="cursor"){
            setAction("dragging");
            setDragStartPosition({x: clientX,y :clientY});
        }

        else{
            const id = elements.length;
            
            let element = createElement(id,clientX,clientY,clientX, clientY, tool,options);
            if(tool==="picture"){
                element = createElement(id,clientX,clientY,clientX, clientY, tool,options,imgSrc);
            }
            setElements(prevState => [...prevState,element]);
            setSelectedElement(element);
            setAction(tool === "text" ? "writing" : "drawing");
        }
    }
    //Handle event when mobile touch move
    const handleTouchMove = (event) => {
        let {clientX, clientY} = event.changedTouches[0];
        const transformedCursorPosition = getTransformedPoint(clientX, clientY);
        clientX = transformedCursorPosition.x;
        clientY = transformedCursorPosition.y;

        if (tool === "selection") {
            const element = getElementAtPosition(clientX, clientY, elements);
            event.target.style.cursor = element? cursorForPosition(element.position) : "default";
        }
    
        if (action === "drawing") {
            const index = elements.length - 1;
            const { x1, y1, options,src } = elements[index];
            //console.log(src);
            updateElement(index, x1, y1, clientX, clientY, tool, options,src);
        } else if (action === "moving") {
            if (selectedElement.type === "pencil") {
                const newPoints = selectedElement.points.map((_, index) => ({
                    x: clientX - selectedElement.xOffsets[index],
                    y: clientY - selectedElement.yOffsets[index],
                }));
                const elementsCopy = [...elements];
                elementsCopy[selectedElement.id] = {
                    ...elementsCopy[selectedElement.id],
                    points: newPoints,
                };
                setSelected(elementsCopy[selectedElement.id]);
                setElements(elementsCopy, true);
            
            }else{
                //Line & rec
                const { id, x1, x2, y1, y2, type, offsetX, offsetY, options,src } = selectedElement;
                const width = x2 - x1;
                const height = y2 - y1;
                const newX1 = clientX - offsetX;
                const newY1 = clientY - offsetY;

                updateElement(id, newX1, newY1, newX1 + width, newY1 + height, type, options,src);
                setSelected(elements[id]);
            }
        } else if (action === "resizing") {
            const { id, type, position, options,src, ...coordinates } = selectedElement;
            const { x1, y1, x2, y2 } = resizedCoordinates(clientX, clientY, position, coordinates);
            updateElement(id, x1, y1, x2, y2, type, options,src);
        }
        if(tool === "cursor"){
            if(action ==="dragging"){
                {   
                    const currentTransformedCursor = getTransformedPoint(event.changedTouches[0].clientX,event.changedTouches[0].clientY);
                    const context = canvasRef.current.getContext('2d');
                    context.translate(currentTransformedCursor.x - dragStartPosition.x, currentTransformedCursor.y - dragStartPosition.y);
                    drawImageToCanvas();
                }
            }
        } 
    };

    //Handle event when mobile touch end
    const handleTouchEnd = async (event) => {
        let {clientX, clientY} = event.changedTouches[0];
        const transformedCursorPosition = getTransformedPoint(clientX, clientY);
        clientX = transformedCursorPosition.x;
        clientY = transformedCursorPosition.y;
        if (selectedElement) {
            if (
                selectedElement.type === "text" &&
                clientX - selectedElement.offsetX === selectedElement.x1 &&
                clientY - selectedElement.offsetY === selectedElement.y1
            ) {
                setAction("writing");
                return;
            }
        
            const index = selectedElement.id;
            const { id, type,options,src } = elements[index];
            if ((action === "drawing" || action === "resizing" || action ==="moving") && adjustmentRequired(type)) {
                const { x1, y1, x2, y2 } = adjustElementCoordinates(elements[index]);
                updateElement(id, x1, y1, x2, y2, type,options,src);
            }
        }
    
        if (action === "writing") return;

        //only for pencil
        if(selectedElement){
            if(selectedRoomId && (selectedElement.type === "pencil"|| selectedElement.type === "text" || selectedElement.type === "circle")){
                db.collection("boards").doc(String(selectedRoomId)).set({elements: JSON.stringify(elements)}) 
            }
        }
        setAction("none");
        setSelectedElement(null);
    };
    
    //function support for writting text
    const handleBlur = event => {
        const { id, x1, y1, type, options } = selectedElement;
        setAction("none");
        setSelectedElement(null);
        updateElement(id, x1, y1, null, null, type, {...options,text:event.target.value} );
    };

    //use mouse wheel to zoom in and zoom out
    const handleWheel = (event) =>{
        let { clientX, clientY } = event;
        if(tool==="cursor"){
            const currentTransformedCursor = getTransformedPoint(clientX, clientY);

            const zoom = event.deltaY < 0 ? 1.1 : 0.9;

            const context = canvasRef.current.getContext('2d');
            context.translate(currentTransformedCursor.x, currentTransformedCursor.y);
            context.scale(zoom, zoom);
            context.translate(-currentTransformedCursor.x, -currentTransformedCursor.y);

            drawImageToCanvas();
        }

    }

    const ZommIn = ()=>{
        
        const currentTransformedCursor = getTransformedPoint(window.innerWidth/2, window.innerHeight/2);
        const zoom =  1.1 ;

        const context = canvasRef.current.getContext('2d');
        context.translate(currentTransformedCursor.x, currentTransformedCursor.y);
        context.scale(zoom, zoom);
        context.translate(-currentTransformedCursor.x, -currentTransformedCursor.y);

        drawImageToCanvas();
        
    }

    const ZoomOut = () =>{
        const currentTransformedCursor = getTransformedPoint(window.innerWidth/2, window.innerHeight/2);

        const zoom =  0.9 ;

        const context = canvasRef.current.getContext('2d');
        context.translate(currentTransformedCursor.x, currentTransformedCursor.y);
        context.scale(zoom, zoom);
        context.translate(-currentTransformedCursor.x, -currentTransformedCursor.y);

        drawImageToCanvas();
    }


    //support calculating coordinates when zoom in and zoom out
    function getTransformedPoint(x, y) {
        const context = canvasRef.current.getContext('2d');
        const inverseTransform = context.getTransform().invertSelf();
        const transformedX = inverseTransform.a * x + inverseTransform.c * y + inverseTransform.e;
        const transformedY = inverseTransform.b * x + inverseTransform.d * y + inverseTransform.f;
        return { x: transformedX, y: transformedY };
      }

    

    return (
        <BoardContext.Provider value={{
            tool,
            setTool,
            elements,
            setElements,
            selected,
            setSelected,
            updateElement,
            options,
            setOptions,
            canvasRef,
            action,
            permission,
            imgSrc,
            setImgSrc,
            drawImageToCanvas
            
        }}>
            {children}
            <Interface />
            {action === "writing" ? (
                <textarea
                ref={textAreaRef}
                onBlur={handleBlur}
                style={{
                    position: "fixed",
                    top: selectedElement.y1 - 2,
                    left: selectedElement.x1,
                    font: "18px sans-serif",
                    resize: "auto",
                    overflow: "hidden",
                    whiteSpace: "pre",
                    background: "transparent",
                }}
                />
            ) : null}

            <canvas id ="canvas"
                    ref={canvasRef}
                    
                    style ={{backgroundColor : '#F5F5F5',width:'100%',height:'100%', margin: '0px'}}
                    width = {window.innerWidth}
                    height = {window.innerHeight}
                
                    onMouseDown={handleMouseDown}
                    onMouseUp = {handleMouseUp}
                    onMouseMove ={handleMouseMove}
                    onWheel = {handleWheel}

                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
            >

            </canvas>
            
            <div className="Action-Bottom" style={{ position: "absolute", bottom: "15px",left: "10px", padding: 10 }}>
                
                <div className="undo-redo-clear" >
                    <button style={{margin: "5px"}} onClick={undo}>Undo</button>
                    <button onClick={redo}>Redo</button>
                    <Clear/>
                    <button style={{margin: "5px"}} onClick={ZommIn}>ZoomIn</button>
                    <button onClick={ZoomOut}>ZoomOut</button>
                </div>
            </div>
        </BoardContext.Provider>
            
    )
}
