import React, { useContext } from 'react';
import { AppContext } from '../../Context/AppProvider';
import { db } from '../../firebase/config';
import { BoardContext } from '../Board';

function Clear(props) {

    const {setElements, setSelected} = useContext(BoardContext);
    const {selectedRoomId} = useContext(AppContext);
    const handleReset = () => {
        db.collection('boards').doc(String(selectedRoomId)).delete();
        setElements([]);
        setSelected(null);
    }

    return (
        
            <button style={{margin:"5px"}} onClick={handleReset}>Clear</button>
        
    );
}

export default Clear;