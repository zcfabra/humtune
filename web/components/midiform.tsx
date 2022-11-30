
import React, { useEffect, useState } from 'react'
import { MidiNoteSequence, notesMap, tempoWidth } from '../typesandconsts';
import { notes } from '../typesandconsts';
import { Track } from '../typesandconsts';
interface MidiFormProps{
    ix: number,
    selected: number | null,
    setSelected: React.Dispatch<React.SetStateAction<number | null>>,
    i: Track<MidiNoteSequence>,
}
const MidiForm:React.FC<MidiFormProps> = ({ix, selected, setSelected, i}) => {
    const generatePathData = (seq: MidiNoteSequence): string=>{
        let out = "";
        let h = 10
        let w = 10;
        console.log("IDATA:", seq.data)
        for (let bar = 0; bar < i.timesToLoop!; bar++){

        
            for (let x of seq.data){
                if (x != null){
                    let y = h + notesMap.get(x)! * 2.5
                    out+=`M ${w},${y}`+`L${w+18 / (16/tempoWidth[i.tempo as keyof object])}, ${y}` 
                }
                w+=18 / (16/ tempoWidth[i.tempo as keyof object]);
            }
        }


        return out;
    }
    const handleDrawPath = (i: MidiNoteSequence)=>{
        const pathData = generatePathData(i)
        return pathData
    }

  

    return (
        <div key={ix}className='w-full h-28 bg-gray-900 flex flex-row items-center'>
       
        <div className='relative w-full bg-black h-full border border-gray-900'>
            <div onClick={()=>setSelected(prev=>prev == ix ? null : ix)} style={{width: `${10 + (i.timesToLoop! * (18 * tempoWidth[i.tempo as keyof object]) + 1)}px`}} className={`h-full flex flex-row cursor-pointer  ${selected == ix ?"bg-purple-500" : "bg-orange-500"}`}>
                <svg className={`w-full stroke-black`}>
                    <path strokeWidth={3} d={handleDrawPath(i.data as MidiNoteSequence)}></path>
                </svg>    
            </div>
        </div>
        {/* <div key={ix} onClick={()=>setSelected(prev=>prev == ix ? null : ix)} className={`h-16 rounded-md cursor-pointer ${selected == ix ? "bg-purple-500" : "bg-orange-400"} ${selected==ix ? "border-purple-300" : "border-orange-300"} border-2 `} style={{width: `${i.length % 1000}px`}}>{JSON.stringify(i.length)}</div> */}
    </div>
)

}

export default MidiForm