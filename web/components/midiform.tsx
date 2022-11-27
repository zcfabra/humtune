
import React, { useEffect, useState } from 'react'
import { notes } from './pianoroll';
import { Track } from './trackview';
export type MidiNoteSequence={
    data: (string | null)[],
    readonly duration: number;
    // readonly length: number;
    // readonly numberOfChannels: number;
    // readonly sampleRate: number;
}
interface MidiFormProps{
    ix: number,
    selected: number | null,
    setSelected: React.Dispatch<React.SetStateAction<number | null>>,
    i: Track<MidiNoteSequence>,
}



export const notesMap = new Map<string, number>(notes.map((i, ix)=>{return[i,ix]}))


const MidiForm:React.FC<MidiFormProps> = ({ix, selected, setSelected, i}) => {
    const generatePathData = (i: MidiNoteSequence): string=>{
        let out = "";
        let h = 10
        let w = 10;
        console.log("IDATA:", i.data)

        for (let x of i.data){
            if (x != null){
                let y = h + notesMap.get(x)! * 2.5
                out+=`M ${w},${y}`+`L${w+18}, ${y}` 
            }
            w+=18;
        }


        return out;
    }
    const handleDrawPath = (i: MidiNoteSequence)=>{
        const pathData = generatePathData(i)
        return pathData
    }

    const [pathData, setPathData] = useState<string>("");
    const handleDrag = (e: React.DragEvent<HTMLDivElement>)=>{
        console.log("HOW HOW")
    }

    return (
        <div key={ix}className='w-full h-28 bg-gray-900 flex flex-row items-center'>
        <div className='w-1/12 h-full bg-gray-900 text-white p-4 flex flex-col'>
            <div className='flex flex-row'>
                <button className='mx-2 rounded-md bg-gray-800 w-8 h-8'>M</button>
                <button className='mx-2 rounded-md bg-gray-800 w-8 h-8'>S</button>
            </div>
        </div>
        <div className='relative w-11/12 bg-black h-full border border-gray-900'>
            <div onClick={()=>setSelected(prev=>prev == ix ? null : ix)} style={{width: `${10 + 18 * 16 + 1}px`}} className={`h-full flex flex-row cursor-pointer  ${selected == ix ?"bg-purple-500" : "bg-orange-500"}`}>
                <svg className={`w-full stroke-black`}>
                    <path strokeWidth={3} d={handleDrawPath(i.data as MidiNoteSequence)}></path>
                </svg>    
                <div draggable onDragStart={handleDrag} className='w-[2px] h-full bg-gray-900 cursor-col-resize'></div>   
            </div>
        </div>
        {/* <div key={ix} onClick={()=>setSelected(prev=>prev == ix ? null : ix)} className={`h-16 rounded-md cursor-pointer ${selected == ix ? "bg-purple-500" : "bg-orange-400"} ${selected==ix ? "border-purple-300" : "border-orange-300"} border-2 `} style={{width: `${i.length % 1000}px`}}>{JSON.stringify(i.length)}</div> */}
    </div>
)

}

export default MidiForm