import React, { useState } from 'react'

const notes = ["C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2", "C3", "C#3", "D3", "D#3", "E3", "F3","F#3" ,"G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4"]
type Notes =  {
    
        [key:string]: boolean
    
}
const PianoRoll = () => {
    const [selectedNotes, setSelectedNotes] = useState<Notes>({});
    const handleSelectedNote = (key: string) =>{
        if (key in selectedNotes){
            setSelectedNotes(prev=>{
                const copy = {...prev}
                delete copy[key];
                return copy; 
            }) 
        } else {
            setSelectedNotes(prev=>({...prev, [key]: true}))
        }
    }

  return (
    <div className='w-full h-2/6 bg-black absolute bottom-0 flex flex-row overflow-y-scroll'>
        <div className='w-2/12 '>
            {notes.map((i, ix)=>(
                <div key={ix}className={`h-12 border-b border-black ${i.includes("#") ? "bg-black text-white": "bg-white text-black"}`} >
                    <span>{i}</span>
                </div>
            ))}
        </div>
        <div className='w-10/12  bg-black border-t border-gray-900 flex flex-row'>
            {[...Array(16)].map((i, ix)=>(
                <div key={ix} className={`w-[6.25%] `}>
                    {notes.map((note, noteIx)=>(
                        <div key={noteIx} onClick={()=>handleSelectedNote(String(ix)+","+String(noteIx))} className={`w-full cursor-pointer h-12 ${String(ix)+","+String(noteIx) in selectedNotes ? "bg-purple-500" :  ix %4 == 0 ? "bg-gray-800" : "bg-black"} border border-gray-900 `}></div>
                    ))}
                </div>
            ))}
        </div>
    </div>
    )
}

export default PianoRoll