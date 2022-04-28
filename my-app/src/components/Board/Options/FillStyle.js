import React, { useEffect} from 'react'
import { BoardContext } from '../Board';

export default function FillStyle() {
    const {
        tool,selected,options,setOptions
    } = React.useContext(BoardContext);


    useEffect(()=>{
        if(selected){
            const currentFillStyle =selected.options.fillStyle;
            document.querySelector('#fillStyle').value = currentFillStyle;  
            setOptions(prev =>({
                ...prev,
                fillStyle:currentFillStyle
            }))
        }

    },[selected]);
    
    
    const handleOnChange = (e) =>{ 
        if(tool === "rectangle" || tool === "line" || tool === "circle"){
            setOptions(prev =>({
                ...prev,
                fillStyle:e.target.value
            }))
        }else if(tool ==="selection"){  
            if(selected){
                selected.options.fillStyle = e.target.value;

                const currentFillStyle =selected.options.fillStyle;
                setOptions(prev =>({
                    ...prev,
                    fillStyle:currentFillStyle
                }))
            }
        }
    }
    
    return (
        <div className="row fillStyle">
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 element_options">                           
                <h6> Fill Style: &nbsp;       
                    <select defaultValue={options.fillStyle} id="fillStyle" onChange={handleOnChange}>
                                <option>hachure</option>
                                <option>solid</option>
                                <option>zigzag</option>
                                <option>cross-hatch</option>
                                <option>dots</option>
                                <option>dashed</option>
                                <option>zigzag-line</option>
                    
                    </select>        
                </h6>            
            </div>
        </div>
    )
}
