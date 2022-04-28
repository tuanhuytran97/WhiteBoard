import { useEffect, useState } from 'react';
import firebase, { db } from './config';

//Create document in firestore
export const addDocument = (collectionn, data) => {
    db.collection(collectionn).add({
        ...data,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
};

//Take document from firestore
export const getDocument = (collectionn,doc_position) => {
    db.collection(collectionn).doc(String(doc_position)).get().then(element =>{
        return element.data();
    })
}

//Take elements from firestore
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
    // list all permutations. ex: name = ["David", "Van", "Teo"]
    // => ["David", "Van", "Teo"], ["David", "Teo", "Van"], ["Teo", "David", "Van"],...
    const name = displayName.split(' ').filter((word) => word);

    const length = name.length;
    let flagArray = [];
    let result = [];
    let stringArray = [];

    /**
     initialize the flag array to false to mark whether the value at this position is already in use
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