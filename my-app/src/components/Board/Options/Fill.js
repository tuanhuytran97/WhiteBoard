import React, { useEffect} from 'react'
import { BoardContext } from '../Board';


export default function Fill() {
    const {
        tool,selected,options,setOptions
    } = React.useContext(BoardContext);
    
    //xảy ra khi selected thay đổi
    useEffect(()=>{
        if(selected ){ //hiển thị lại theo element được chọn
            //console.log({selected})
            if(selected.type === "line" || selected.type ==="rectangle" || selected.type === "circle"){
                const currentFill =selected.options.fill;
                document.querySelector('#fillColor').value = currentFill;  
                setOptions(prev =>({
                    ...prev,
                    fill:currentFill,
                    penFillStyle:currentFill
                }))
            }else if(selected.type === "pencil" || selected.type === "text"){
                const currentFill =selected.options.penFillStyle;
                document.querySelector('#fillColor').value = currentFill;  
                setOptions(prev =>({
                    ...prev,
                    fill:currentFill,
                    penFillStyle:currentFill
                }))
            }
            
        }

    },[selected]);
    
    //khi thay đổi giá trị
    const chaneColor = (e) =>{ 
        if(tool === "rectangle" || tool === "line" || tool === "circle"){//đổi màu bút vẽ
            setOptions(prev =>({
                ...prev,
                fill:e.target.value
            }))
        
        }else if(tool === "pencil" || tool === "text"){
            setOptions(prev =>({
                ...prev,
                penFillStyle:e.target.value
            }))

        }else if(tool ==="selection"){ //đổi màu element và đổi màu bút vẽ 
            if(selected){
                if(selected.type === "line" || selected.type === "rectangle" || selected.type === "circle"){
                    selected.options.fill = e.target.value;
    
                    const currentFill =selected.options.fill;
                    setOptions(prev =>({
                        ...prev,
                        fill:currentFill
                    }))
                }else if(selected.type === "pencil" || selected.type === "text"){
                    selected.options.penFillStyle = e.target.value;
    
                    const currentFill =selected.options.penFillStyle;
                    setOptions(prev =>({
                        ...prev,
                        penFillStyle:currentFill
                    }))
                }
            }
            
        }
    }
    return (
        <div className="row color-picker">
                    <div className="col-xs-12 col-sm-12 col-md-12 col-lg-12 element_options">                          
                        <h6>Color: &nbsp;
                            <input id="fillColor" type="color" defaultValue={options.penFillStyle} onChange={chaneColor}/>
                        </h6>                           
                    </div>
        </div>
    )
}
