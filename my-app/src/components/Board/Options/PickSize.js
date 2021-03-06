import React, {useEffect } from 'react'
import { BoardContext } from '../Board';


export default function PickSize() {

    const {
        tool,selected,options,setOptions,elements,setElements
    } = React.useContext(BoardContext);
    if(selected){
        const {id} = selected;
    }
    

    useEffect(()=>{
        if(selected){
            const currentstrokeWidth =selected.options.strokeWidth;
            document.querySelector('#StrokeWidth').value = currentstrokeWidth;  
            setOptions(prev =>({
                ...prev,
                strokeWidth:currentstrokeWidth
            }))
        }

    },[selected]);
    

    const changeSize = (e) =>{ 
        if(tool === "rectangle" || tool === "line" || tool === "circle"){
            setOptions(prev =>({
                ...prev,
                strokeWidth:e.target.value
            }))
        }else if(tool ==="selection"){
            if(selected){
                console.log("width : ",selected.options.strokeWidth);
                selected.options.strokeWidth = e.target.value;

                const currentstrokeWidth =selected.options.strokeWidth;
                setOptions(prev =>({
                    ...prev,
                    strokeWidth:currentstrokeWidth
                }))
            }
        }
    }
    return (
        <div className="row slide-container">
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 element_options">                           
                <h6> Size: &nbsp;
                <select defaultValue={options.strokeWidth} id="StrokeWidth" onChange= {changeSize}>
                                <option>1</option>
                                <option>2</option>
                                <option>3</option>
                                <option>4</option>
                                <option>5</option>
                  </select>        
                </h6>                           
            </div>
        </div>
    )
}
