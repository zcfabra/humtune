import React, { useEffect, useState } from 'react'
import * as Tone from "tone";
import { MidiNoteSequence } from './midiform';

export const notes = ["C2", "C#2", "D2", "D#2", "E2", "F2", "F#2", "G2", "G#2", "A2", "A#2", "B2", "C3", "C#3", "D3", "D#3", "E3", "F3","F#3" ,"G3", "G#3", "A3", "A#3", "B3", "C4", "C#4", "D4", "D#4", "E4", "F4", "F#4", "G4", "G#4", "A4", "A#4", "B4"]
type Notes =  {
    
        [key:string]: boolean
    
}
interface PianoRollProps{
    showPianoRoll: boolean,
    data: MidiNoteSequence,
    selected: number | null ,
    setTracks: React.Dispatch<React.SetStateAction<(MidiNoteSequence | AudioBuffer)[]>>,
    setShowPianoRoll: React.Dispatch<React.SetStateAction<boolean>>
}
const PianoRoll: React.FC<PianoRollProps> = ({setShowPianoRoll, data, setTracks, selected}) => {
    // const [trackData, setTrackData] = useState<MidiNoteSequence>()
    const [synth, setSynth] = useState<Tone.Synth<Tone.SynthOptions> | Tone.AMSynth>();
    useEffect(()=>{
        // var freeverb = new Tone.Freeverb();
        // freeverb.dampening = 10000;
        // setTrackData(data)

        var synth = new Tone.Synth().toDestination();
        setSynth(synth);
    }, [])
    const handleSelectedNote = (ix:number, noteIx: number) =>{
        let copy = data
        copy.data[ix] = copy.data[ix] == notes[noteIx] ? null : notes[noteIx]


        setTracks(prev=>{  
            // let copy = [...(prev[selected!] as MidiNoteSequence).data];
            // copy[ix] = copy[ix] == notes[noteIx] ? null : notes[noteIx];
            (prev[selected!] as MidiNoteSequence) = copy
            return [...prev]
        })
    }
    const handleGetNoteMidi = (ix: number)=>{
        console.log(ix)
    }

//   const playSynth = ()=>{


//     if (synth){
//         synth.toDestination();
//         const now = Tone.now();
//       let offset = 0;
      
//       for (let each of data.data){
//           if (each){
//               synth.triggerAttackRelease(each, "32n",now + offset)
//             }
//             offset+=0.25
//         }
//         Tone.start();
//     }

//   }  
  return (
    <div className='w-full h-2/6 bg-black absolute bottom-0 flex flex-row overflow-y-scroll'>
        <div className='w-2/12 '>
            <div className='w-full h-12 '>
                {/* <button onClick={playSynth} className='w-full h-full bg-purple-500'> Play</button> */}
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
            {data.data.map((i, ix)=>(
                <div key={ix} className={`w-[6.25%]`}>
                    {notes.map((note, noteIx)=>(
                        <div key={noteIx} onClick={()=>handleSelectedNote(ix, noteIx)} className={`w-full cursor-pointer h-12 ${i && i == note ? "bg-purple-500" :  ix %4 == 0 ? "bg-gray-800" : "bg-black"} border border-gray-900 `}></div>
                    ))}
                </div>
            ))}
            </div>
        </div>
    </div>
    )
}

export default PianoRoll