import React, {useEffect} from 'react'
import { BoardContext } from '../Board';

export default function StrokeColor() {
    const {
        tool,selected,options,setOptions
    } = React.useContext(BoardContext);


    useEffect(()=>{
        if(selected){
            const currentStroke =selected.options.stroke;
            document.querySelector('#strokeColor').value = currentStroke;  
            setOptions(prev =>({
                ...prev,
                stroke:currentStroke
            }))
        }

    },[selected]);
    
    const chaneColor = (e) =>{ 
        if(tool === "rectangle" || tool === "line" || tool === "circle"){
            setOptions(prev =>({
                ...prev,
                stroke:e.target.value
            }))
        }else if(tool ==="selection"){
            if(selected){
                selected.options.stroke = e.target.value;

                const currentStroke =selected.options.stroke;
                setOptions(prev =>({
                    ...prev,
                    stroke:currentStroke
                }))
            }
        }
    }
    return (

        <div className="row color-picker">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 element_options">                          
                        <h6> Stroke Color: &nbsp;
                            <input id ="strokeColor" type="color" color={options.stroke} onChange={chaneColor}/>
                        </h6>                           
                    </div>
        </div>  

    )
}
