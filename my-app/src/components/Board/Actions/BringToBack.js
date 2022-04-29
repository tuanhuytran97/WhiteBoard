import React from "react";
import { BoardContext } from "../Board";
import bringToBack from '../picture/bringToBack.png';

export default function BringToBack() {
    const {
        selected,setSelected,elements,setElements
    } = React.useContext(BoardContext);

    //move element to the end of the array
    const handleBringToBack = () => {
        if(selected){
            const {id} = selected;
            const elementCopy = elements;

            elementCopy[id].id = 0;
            const temp = elementCopy[0];
            temp.id = id;

            elementCopy[0] = elementCopy[id];
            elementCopy[id] = temp;
            setElements([...elementCopy],true);
            setSelected(elementCopy[0]);
        }
    }
    return (
        <div className="BringToFont">
                    <label title='Bring to Back'>
                        <input aria-label="BringToFont" type="image" 
                        id="BringToFont" 
                        width="40px" height="40px" 
                        src={bringToBack}
                        onClick = {handleBringToBack} /> 
                            
                    </label>
        </div>
    )
}
