import React, { useEffect } from 'react'
import { BoardContext } from '../Board';

export default function PencelSize() {
    const {
        tool,selected,options,setOptions
    } = React.useContext(BoardContext);

    useEffect(()=>{
        if(selected){
            const currentSize =selected.options.size;
            document.querySelector('#pencelSize').value = currentSize;  
            setOptions(prev =>({
                ...prev,
                size:currentSize
            }))
        }

    },[selected]);
    
    const changeSize = (e) =>{ 
        if(tool === "pencil"){

            setOptions(prev =>({
                ...prev,
                size: e.target.value 
            }))
            
        }else if(tool ==="selection"){
            if(selected){
                selected.options.size = e.target.value;

                const currentSize =selected.options.size;
                setOptions(prev =>({
                    ...prev,
                    size:currentSize
                }))
            }
        }
    }
    return (
        <div className="row slide-container">
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 element_options">                           
                <h6> Size: &nbsp;
                <select defaultValue={options.size} id="pencelSize" onChange= {changeSize}>
                                <option>1</option>
                                <option>5</option>
                                <option>10</option>
                                <option>15</option>
                                <option>20</option>
                  </select>        
                </h6>                           
            </div>
        </div>
    )
}
