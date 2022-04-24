import getStroke from "perfect-freehand";
import { useContext, useState } from "react";
import rough from 'roughjs/bundled/rough.esm';
import { AppContext } from "../Context/AppProvider";
import { db } from "../firebase/config";
import { BoardContext } from "./Board";


// Gets the relevant location from a mouse or single touch event
export const getEventLocation = (e) =>
{
    if (e.touches && e.touches.length == 1)
    {
        return { x:e.touches[0].clientX, y: e.touches[0].clientY }
    }
    else if (e.clientX && e.clientY)
    {
        return { x: e.clientX, y: e.clientY }        
    }
}

export const  getBase64 = (file) =>{
    let data = null;
    var reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = ()  =>{
        console.log(reader.result);
        data = reader.result;
    };
    reader.onerror = function (error) {
      console.log('Error: ', error);
    };
    return data;
}

    const useHistory = initialState => {
        const [index, setIndex] = useState(0);
        const [history, setHistory] = useState([initialState]);
        const setState = (action, overwrite = false) => {
            
            const newState = typeof action === "function" ? action(history[index]) : action;
            if (overwrite) {
                const historyCopy = [...history];
                historyCopy[index] = newState;
                setHistory(historyCopy);
            }else{
                const updatedState = [...history].slice(0, index + 1);
                setHistory([...updatedState, newState]);
                setIndex(prevState => prevState + 1);
            }
        };
        const undo = () => index > 0 && setIndex(prevState => prevState - 1);
        const redo = () => index < history.length - 1 && setIndex(prevState => prevState + 1);
        return [history[index], setState, undo, redo];
    };


const adjustElementCoordinates = element => {
    const { type, x1, y1, x2, y2 } = element;
    if (type === "rectangle" || type === "picture") {
        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);
        return { x1: minX, y1: minY, x2: maxX, y2: maxY };
    } else {
        if (x1 < x2 || (x1 === x2 && y1 < y2)) {
        return { x1, y1, x2, y2 };
        } else {
        return { x1: x2, y1: y2, x2: x1, y2: y1 };
        }
    }
};

const updateIndexElements = (elements) => {
    for(var i = 0; i < elements.length; i++){
        if(elements[i].id === i){
            continue;
        }else{
            elements[i].id =i;
            continue;
        }
    }
}

const getElementAtPosition = (x, y, elements) => {
    return elements.slice().reverse()
        .map(element => ({ ...element, position: positionWithinElement(x, y, element) }))
        .find(element => element.position !== null && element.isDeleted === false);
};

const positionWithinElement = (x, y, element) => {
    const { type, x1, x2, y1, y2 } = element;
    switch (type) {
        case "line":
            const on = onLine(x1, y1, x2, y2, x, y);
            const start = nearPoint(x, y, x1, y1, "start");
            const end = nearPoint(x, y, x2, y2, "end");
            return start || end || on;
        case "rectangle":
            const topLeft = nearPoint(x, y, x1, y1, "tl");
            const topRight = nearPoint(x, y, x2, y1, "tr");
            const bottomLeft = nearPoint(x, y, x1, y2, "bl");
            const bottomRight = nearPoint(x, y, x2, y2, "br");
            const inside = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
            return topLeft || topRight || bottomLeft || bottomRight || inside;
        case "circle":
            const r = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2,2))/2;
            const insideCircle = Math.sqrt((x-x1)*(x-x1) + (y-y1)*(y-y1)) < r ? "inside" : null;
            const onLineC = Math.sqrt((x-x1)*(x-x1) + (y-y1)*(y-y1)) >= r
            && Math.sqrt((x-x1)*(x-x1) + (y-y1)*(y-y1)) <= r + 5
            ? "onLine" : null;
            return insideCircle || onLineC;
        case "picture":
            const topL = nearPoint(x, y, x1, y1, "tl");
            const topR = nearPoint(x, y, x2, y1, "tr");
            const bottomL = nearPoint(x, y, x1, y2, "bl");
            const bottomR = nearPoint(x, y, x2, y2, "br");
            const insideP = x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
            return topL || topR || bottomL || bottomR || insideP;
        case "pencil":
            const betweenAnyPoint = element.points.some((point, index) => {
                const nextPoint = element.points[index + 1];
                if (!nextPoint) return false;
                return onLine(point.x, point.y, nextPoint.x, nextPoint.y, x, y, 5) != null;
            });
            return betweenAnyPoint ? "inside" : null;
        case "text":
            return x >= x1 && x <= x2 && y >= y1 && y <= y2 ? "inside" : null;
        default:
            throw new Error(`Type not recognised: ${type}`);
    }
};

const nearPoint = (x,y,x1,y1, name) =>{
    return Math.abs(x - x1) < 5 && Math.abs(y - y1) < 5 ? name : null;
}
const onLine = (x1, y1, x2, y2, x, y, maxDistance = 1) => {
    const a = { x: x1, y: y1 };
    const b = { x: x2, y: y2 };
    const c = { x, y };
    const offset = distance(a, b) - (distance(a, c) + distance(b, c));
    return Math.abs(offset) < maxDistance ? "inside" : null;
};

const distance = (a,b) => Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y,2));

const resizedCoordinates = (clientX, clientY, position, coordinates) => {
    const { x1, y1, x2, y2 } = coordinates;
    switch (position) {
        case "tl":
        case "start":
            return { x1: clientX, y1: clientY, x2, y2 };
        case "tr":
            return { x1, y1: clientY, x2: clientX, y2 };
        case "bl":
            return { x1: clientX, y1, x2, y2: clientY };
        case "br":
        case "end":
        case "onLine":
            return { x1, y1, x2: clientX, y2: clientY };
        default:
            return null; //should not really get here...
    }
};
const cursorForPosition = position => {
    switch (position) {
        case "tl":
        case "br":
        case "start":
        case "end":
        case "onLine":
        return "nwse-resize";
        case "tr":
        case "bl":
        return "nesw-resize";
        default:
        return "move";
    }
};


const createElement = (id, x1, y1, x2, y2, type,options, src) => {
    switch (type) {
        case "line":
            return { id, isDeleted : false, x1, y1, x2, y2, type, options };
        case "rectangle":
            return { id, isDeleted : false, x1, y1, x2, y2, type, options };
        case "circle":
            return { id, isDeleted : false, x1, y1, x2, y2, type, options };
        case "pencil":
            return { id, isDeleted: false, type, points: [{ x: x1, y: y1 }], options };
        case "text":
            return { id, isDeleted: false, x1, y1, x2, y2,type, options };
        case "picture":
            return { id, isDeleted: false, x1, y1, x2, y2,type, options,src };
        default:
            throw new Error(`Type not recognised: ${type}`);
    }
};

const adjustmentRequired = type => ["line", "rectangle", "picture"].includes(type);
const getSvgPathFromStroke = stroke => {
    if (!stroke.length) return "";

    const d = stroke.reduce(
        (acc, [x0, y0], i, arr) => {
            const [x1, y1] = arr[(i + 1) % arr.length];
            acc.push(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2);
            return acc;
        },
        ["M", ...stroke[0], "Q"]
    );

    d.push("Z");
    return d.join(" ");
};

const isMembers = (members,uid) => {
    let count = 0;
    members.forEach((mem) => {
        if(mem.uid === uid){
            count = count + 1;
        }
    })
    return count !== 0? true : false;
    
}

export {
    useHistory,
    adjustElementCoordinates, 
    updateIndexElements, 
    getElementAtPosition, 
    resizedCoordinates, 
    cursorForPosition, 
    createElement, 
    getSvgPathFromStroke, 
    adjustmentRequired,
    isMembers,
    distance
};