import { useContext, useEffect, useState } from 'react';
import { BoardContext } from '../Board/Board';
import firebase, { db } from './config';

export const addDocument = (collectionn, data) => {
    db.collection(collectionn).add({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
};

export const getDocument = (collectionn,doc_position) => {
    db.collection(collectionn).doc(String(doc_position)).get().then(element =>{
        return element.data();
    })
}

export const useGetData = (selectedRoomId) =>{
    const [elements,setElements] = useState([]);
    useEffect(()=>{
        if(selectedRoomId){
            db.collection("boards").doc((String(selectedRoomId))).get().then((snap) => {
                if(snap.data()){
                    const data = JSON.parse(snap.data().elements);
                    setElements([...data]);
                }else{
                    setElements([]);
                    const canvasRef = document.getElementById('canvas');
                    if(canvasRef){
                        const context = canvasRef.getContext('2d');
                        context.clearRect(0, 0, canvasRef.width, canvasRef.height);
                    }
                    
                }
            })
        }else{
           
            setElements([]);
        }
    },[selectedRoomId])
    return elements;
    
}

export const generateKeywords = (displayName) => {
    // liet ke tat cac hoan vi. vd: name = ["David", "Van", "Teo"]
    // => ["David", "Van", "Teo"], ["David", "Teo", "Van"], ["Teo", "David", "Van"],...
    const name = displayName.split(' ').filter((word) => word);

    const length = name.length;
    let flagArray = [];
    let result = [];
    let stringArray = [];

    /**
     * khoi tao mang flag false
     * dung de danh dau xem gia tri
     * tai vi tri nay da duoc su dung
     * hay chua
     **/
    for (let i = 0; i < length; i++) {
        flagArray[i] = false;
    }
    const createKeywords = (name) => {
        const arrName = [];
        let curName = '';
        name.split('').forEach((letter) => {
            curName += letter;
            arrName.push(curName);
        });
        //console.log({arrName});
        return arrName;
    };
    
        function findPermutation(k) {
            for (let i = 0; i < length; i++) {
                if (!flagArray[i]) {
                    flagArray[i] = true;
                    result[k] = name[i];
            
                    if (k === length - 1) {
                        stringArray.push(result.join(' '));
                    }
            
                    findPermutation(k + 1);
                    flagArray[i] = false;
                }
            }
        }
    
        findPermutation(0);
    
        const keywords = stringArray.reduce((acc, cur) => {
            const words = createKeywords(cur);
            return [...acc, ...words];
        }, []);
    
        return keywords;
    };