import React from 'react'
import DeleteImg from '../picture/close.png';
import { BoardContext } from '../Board';
import { AppContext } from '../../Context/AppProvider';
import { db } from '../../firebase/config';

export default function Delete() {

    const {
        selected,setSelected,elements,setElements
    } = React.useContext(BoardContext);
    const {selectedRoomId} = React.useContext(AppContext);
  
    //delete selected element
    function removeElementId() {
        const elementCopy = [...elements];
        const {id} = selected;
        elementCopy[id].isDeleted = true;
        setElements(elementCopy);
        setSelected(null);
        db.collection("boards").doc(String(selectedRoomId)).set({elements: JSON.stringify(elementCopy)}) 
    }
    return (
        <div className="Delete">
                    <label title='Eraser element'>
                        <input aria-label="Delete" type="image" id="delete" src={DeleteImg} width="40px" height="40px" 
                        onClick = {() => removeElementId()} /> 
                            
                    </label>
        </div>
    )
}
