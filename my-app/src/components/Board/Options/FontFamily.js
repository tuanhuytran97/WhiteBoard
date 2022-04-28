import React, { useEffect } from "react";
import { BoardContext } from "../Board";

export default function FontFamily() {
    const {
        tool,selected,options,setOptions
    } = React.useContext(BoardContext);


    useEffect(()=>{
        if(selected){
            console.log({selected});
            const current =selected.options.fontFamily;
            document.querySelector('#FontFamily').value = current;  
            setOptions(prev =>({
                ...prev,
                fontFamily:current
            }))
        }

    },[selected]);
    

    const changeSize = (e) =>{ 
        if(tool === "text"){
            setOptions(prev =>({
                ...prev,
                fontFamily:e.target.value
            }))
        }else if(tool ==="selection"){
            if(selected){
                console.log("width : ",selected.options.fontFamily);
                selected.options.fontFamily = e.target.value;

                const current =selected.options.fontFamily;
                setOptions(prev =>({
                    ...prev,
                    fontFamily:current
                }))
            }
        }
    }
    return (
        <div className="row slide-container">
            <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 element_options">                           
                <h6> Font-Family: &nbsp;
                <select defaultValue={options.fontFamily} id="FontFamily" onChange= {changeSize}>
                                <option>cursive</option>
                                <option>serif</option>
                                <option>fantasy</option>
                                <option>Georgia</option>
                  </select>        
                </h6>                           
            </div>
        </div>
    )
}
