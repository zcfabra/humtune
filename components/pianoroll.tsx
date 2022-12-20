import React, { useEffect, useState } from 'react'
import * as Tone from "tone";
import { SynthPack } from '../pages';
import { MidiNoteSequence, notes } from '../typesandconsts';
import { Track } from '../typesandconsts';


interface PianoRollProps{
    showPianoRoll: boolean,
    track: Track<MidiNoteSequence>,
    selected: number | null ,
    setTracks: React.Dispatch<React.SetStateAction<Track<MidiNoteSequence | AudioBuffer>[]>>,
    setShowPianoRoll: React.Dispatch<React.SetStateAction<boolean>>
}
const PianoRoll: React.FC<PianoRollProps> = ({setShowPianoRoll, track, setTracks, selected}) => {
    // const [trackData, setTrackData] = useState<MidiNoteSequence>()
    // const [synth, setSynth] = useState<Tone.Synth<Tone.SynthOptions>>();
    // useEffect(()=>{
    //     // var freeverb = new Tone.Freeverb();
    //     // freeverb.dampening = 10000;
    //     // setTrackData(data)

    //     var synth = new Tone.Synth().toDestination();
    //     setSynth(synth);
    // }, [])
    const [tempSynth, setTempSynth] = useState<Tone.Synth>();

    useEffect(()=>{
        var synthStats = (track.soundMaker as SynthPack).get();
        // console.log(synthStats)
        let newSynth = new Tone.Synth().toDestination();
        // newSynth.set(newNotes);
        setTempSynth(newSynth)
        // console.log(newNotes)
    }, [])
    const handleSelectedNote = (ix:number, noteIx: number) =>{
        let copy = track.data;
        (copy as MidiNoteSequence).data[ix] = (copy as MidiNoteSequence).data[ix] == notes[noteIx] ? null : notes[noteIx]


        setTracks((prev)=>{  
            // let copy = [...(prev[selected!] as MidiNoteSequence).data];
            // copy[ix] = copy[ix] == notes[noteIx] ? null : notes[noteIx];
            prev[selected!].data = copy;
            return [...prev]
        })
    }


    const synthPlay = (note: string)=>{
        tempSynth!.triggerAttackRelease(note, "8n", Tone.immediate());
    }
  return (
    <div className='w-full h-2/6 bg-black absolute bottom-0 flex flex-row overflow-y-scroll'>
        <div className='w-2/12 '>
            <div className='w-full h-12 '>
                {/* <button onClick={playSynth} className='w-full h-full bg-purple-500'> Play</button> */}
            </div>
            {notes.map((i, ix)=>(
                <div onClick={()=>synthPlay(i)}key={ix}className={`h-12 cursor-pointer border-b border-black ${i.includes("#") ? "bg-black text-white": "bg-white text-black"}`} >
                    <span className='select-none'>{i}</span>
                </div>
            ))}
        </div>
        <div className='w-10/12 border-t border-gray-900'>
            <div className=' w-full h-12 flex flex-row'>
                {[...Array(16)].map((i,ix)=>(
                    <div  key={ix}className={` h-full transition-all text-gray-500 hover:bg-orange-500 hover:text-white  w-[6.25%] ${ix %4 ==0 ?"bg-gray-800" : "bg-black"} border border-gray-900 p-2`}>
                        <span className='select-none font-light  text-xl '>{ix + 1}</span>
                    </div>
                ))}
            </div>
            <div className=' w-full flex flex-row'>
            {((track.data as MidiNoteSequence).data).map((i, ix)=>(
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