import React, { useEffect } from "react";
import { BoardContext } from "../Board";

export default function FontSize() {
    const {
        tool,selected,options,setOptions,elements,setElements
    } = React.useContext(BoardContext);


    useEffect(()=>{
        if(selected){
            console.log({selected});
            const current =selected.options.fontSize;
            document.querySelector('#FontSize').value = current;  
            setOptions(prev =>({
                ...prev,
                fontSize:current
            }))
        }

    },[selected]);
    

    const changeSize = (e) =>{ 
        if(tool === "text"){
            setOptions(prev =>({
                ...prev,
                fontSize:e.target.value
            }))
        }else if(tool ==="selection"){
            if(selected){
                console.log("width : ",selected.options.fontSize);
                selected.options.fontSize = e.target.value;

                const current =selected.options.fontSize;
                setOptions(prev =>({
                    ...prev,
                    fontSize:current
                }))
            }
        }
    }
    return (
        <div className="row slide-container">
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 element_options">                           
                <h6> Size: &nbsp;
                <select defaultValue={options.fontSize} id="FontSize" onChange= {changeSize}>
                                <option>10px</option>
                                <option>20px</option>
                                <option>30px</option>
                                <option>40px</option>
                                <option>50px</option>
                  </select>        
                </h6>                           
            </div>
        </div>
    )
}
