
import React, { useEffect, useRef, useState } from 'react'
import { generatePathData } from '../drawwaveform';
import MidiForm, { MidiNoteSequence } from './midiform';
import Waveform from './waveform';
import * as Tone from "tone"
import { NoteSequence } from '@magenta/music';
import { DEFAULT_SAMPLE_RATE } from '../pages';

interface TrackViewProps {

    tracks: (AudioBuffer | MidiNoteSequence)[],
    globalContext: AudioContext,
    bpm: number,
    selected: number | null,
    setSelected:React.Dispatch<React.SetStateAction<number | null>>
}

const  TrackView: React.FC<TrackViewProps> = ({tracks, globalContext, bpm, selected, setSelected}) => {

    useEffect(()=>{
        setSynth(new Tone.Synth())
    },[])
    const [currentMix, setCurrentMix] = useState<AudioBufferSourceNode>()
    const masterMixRef = useRef<HTMLAudioElement>(null);
    const [synth, setSynth ] = useState<Tone.Synth>()
    // const svgRef = useRef<SVGPathElement>(null);

    const playSynth = (track:MidiNoteSequence)=>{

            //play a middle 'C' for the duration of an 8th note
                if (synth){
                    synth.toDestination();
                    const now = Tone.now();
                  let offset = 0;
                  
                  Tone.start();
                  for (let each of track.data){
                      if (each){
                          synth.triggerAttackRelease(each, "32n",now + offset)
                        }
                        offset+=0.25
                    }
                }
            
    }
    
    const playAll = async ()=>{

        globalContext.resume();
        let maxLen: number = 0;
        for (let track of tracks){ // currently, ignores midi sequences; may need to change later
            if (track instanceof AudioBuffer){
                if (track.length > maxLen){
                    maxLen = track.length;
                }
            }
        }
        let bufferSource = globalContext.createBuffer(1, maxLen > 0 ? maxLen : 10000, DEFAULT_SAMPLE_RATE);
        let buffer = bufferSource.getChannelData(0);
        for (let track of tracks){
            if (track instanceof AudioBuffer) {
                let trackBuffer = track.getChannelData(0);
                for (let i = 0; i < trackBuffer.length; i++){
                    buffer[i] += trackBuffer[i];
                }
            } else {
                console.log("CALLED SYNTH");
                console.log(track)
                Tone.start();
                playSynth(track)
            }
        }    
        
        
        
        let finalMix = globalContext!.createBufferSource();
        finalMix.buffer = bufferSource;
        finalMix.connect(globalContext.destination);
        await globalContext.resume();
        setCurrentMix(finalMix);
        finalMix.start();
        Tone.start();

    }

  return (
    <div className='w-full bg-black h-full flex flex-col items-center'>
        <div className='w-full h-16 border-b border-black flex flex-row justify-center items-center'>
            <span className='text-white'>BPM: {bpm}</span>
            <button className='w-32 h-12 text-orange-500 rounded-md text-5xl' onClick={()=>tracks.length > 0 && playAll()}>&#9658;</button>
        </div>
        <div className='w-full'>
            <div className='w-full h-12 flex  flex-row'>
                <div className='w-1/12 bg-black'></div>
                <div className='w-11/12 bg-black overflow-x-scroll'>
                    {[...Array(100)].map((i, ix)=>(
                        <span key={ix}className={`mx-4 border-l-2 ${ix %4 ==0 ? "border-orange-400 border-l-2" : "border-gray-900"}`}></span>
                    ))}
                </div>
            </div>
            {tracks.map((i, ix)=>{
                return i instanceof AudioBuffer
                ?
                 <Waveform i={i} ix={ix} selected={selected} setSelected={setSelected} key={ix}/>
                :
                <MidiForm i={i} ix={ix} selected={selected} setSelected={setSelected} key={ix}/>
            })}

        </div>
    </div>
    )
}

export default TrackView 