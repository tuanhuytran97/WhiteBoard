import React, {useState,useEffect} from 'react'
import { BoardContext } from '../Board';

export default function StrokeColor() {
    const {
        tool,selected,options,setOptions
    } = React.useContext(BoardContext);

    //xảy ra khi selected thay đổi
    useEffect(()=>{
        if(selected){ //hiển thị lại theo element được chọn
            const currentStroke =selected.options.stroke;
            document.querySelector('#strokeColor').value = currentStroke;  
            setOptions(prev =>({
                ...prev,
                stroke:currentStroke
            }))
        }

    },[selected]);
    
    //khi thay đổi giá trị
    const chaneColor = (e) =>{ 
        if(tool === "rectangle" || tool === "line" || tool === "circle"){//đổi màu bút vẽ
            setOptions(prev =>({
                ...prev,
                stroke:e.target.value
            }))
        }else if(tool ==="selection"){ //đổi màu element và đổi màu bút vẽ 
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
