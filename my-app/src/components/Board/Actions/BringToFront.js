import React from "react";
import { BoardContext } from "../Board";
import bringToFront from '../picture/bringToFront.png';

export default function BringToFront() {
    const {
        selected,setSelected,elements,setElements
    } = React.useContext(BoardContext);

    //move element to the beginning of the array
    const handleBringToFront = () => {
        if(selected){
            const {id} = selected;
            const elementCopy = elements;
            const length = elementCopy.length -1;

            elementCopy[id].id = length;
            const temp = elementCopy[length];
            temp.id = id;

            elementCopy[length] = elementCopy[id];
            elementCopy[id] = temp;
            //console.log(elementCopy);
            setElements([...elementCopy],true);
            setSelected(elementCopy[length]);
        }
    }
    return (
        <div className="BringToFont">
                    <label title='Bring to Font'>
                        <input aria-label="BringToFont" type="image" 
                        id="BringToFont" 
                        width="40px" height="40px" 
                        src={bringToFront}
                        onClick = {handleBringToFront} /> 
                            
                    </label>
        </div>
    )
}
