import React, { useEffect, useState } from 'react'
import * as Tone from "tone";

const notes = ["C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2", "C3", "C#3", "D3", "D#3", "E3", "F3","F#3" ,"G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4"]
type Notes =  {
    
        [key:string]: boolean
    
}
interface PianoRollProps{
    showPianoRoll: boolean,
    setShowPianoRoll: React.Dispatch<React.SetStateAction<boolean>>
}
const PianoRoll: React.FC<PianoRollProps> = ({setShowPianoRoll}) => {
    const [selectedNotes, setSelectedNotes] = useState<(string | null)[]>(notes.map(i=>null))
    const [synth, setSynth] = useState<Tone.Synth<Tone.SynthOptions> | Tone.AMSynth>();
    useEffect(()=>{
        var freeverb = new Tone.Freeverb();
        freeverb.dampening = 10000;

        var synth = new Tone.Synth().toDestination();
        setSynth(synth);
    }, [])
    const handleSelectedNote = (ix:number, noteIx: number) =>{
        setSelectedNotes(prev=>{
            const copy = [...prev];
            copy[ix] = copy[ix] != null ? null : notes[noteIx]
            return copy
        })
       
    }
    const handleGetNoteMidi = (ix: number)=>{
        console.log(ix)
    }

  const playSynth = ()=>{

//play a middle 'C' for the duration of an 8th note
    if (synth){

      const now = Tone.now();
      let offset = 0;
      Tone.start();
      
      for (let each of selectedNotes){
        if (each){
            synth.triggerAttackRelease(each, "32n",now + offset)
        }
        offset+=0.125
      }
    }

  }  
  return (
    <div className='w-full h-2/6 bg-black absolute bottom-0 flex flex-row overflow-y-scroll'>
        <div className='w-2/12 '>
            <div className='w-full h-12 '>
                <button onClick={playSynth} className='w-full h-full bg-purple-500'> Play</button>
            </div>
            {notes.map((i, ix)=>(
                <div key={ix}className={`h-12 cursor-pointer border-b border-black ${i.includes("#") ? "bg-black text-white": "bg-white text-black"}`} >
                    <span>{i}</span>
                </div>
            ))}
        </div>
        <div className='w-10/12 border-t border-gray-900'>
            <div className=' w-full h-12 flex flex-row'>
                {[...Array(16)].map((i,ix)=>(
                    <div onClick={()=>handleGetNoteMidi(ix)} key={ix}className={` h-full transition-all text-gray-500 hover:bg-orange-500 hover:text-white cursor-pointer w-[6.25%] ${ix %4 ==0 ?"bg-gray-800" : "bg-black"} border border-gray-900 p-2`}>
                        <span className=' font-light  text-xl '>{ix + 1}</span>
                    </div>
                ))}
            </div>
            <div className=' w-full flex flex-row'>
            {[...Array(16)].map((i, ix)=>(
                <div key={ix} className={`w-[6.25%]`}>
                    {notes.map((note, noteIx)=>(
                        <div key={noteIx} onClick={()=>handleSelectedNote(ix, noteIx)} className={`w-full cursor-pointer h-12 ${selectedNotes[ix] == notes[noteIx] ? "bg-purple-500" :  ix %4 == 0 ? "bg-gray-800" : "bg-black"} border border-gray-900 `}></div>
                    ))}
                </div>
            ))}
            </div>
        </div>
    </div>
    )
}

export default PianoRoll