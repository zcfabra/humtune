
import React, { useContext, useEffect, useRef, useState } from 'react'
import { generatePathData } from '../drawwaveform';
import { MidiNoteSequence, Track } from '../typesandconsts';
import Waveform from './waveform';
import * as Tone from "tone"
import { DEFAULT_SAMPLE_RATE, SynthPack, isPlayingContext } from '../pages';
import { isMidiSequence } from '../utils';
import MidiForm from './midiform';



interface TrackViewProps {
    tracks: Track<MidiNoteSequence | AudioBuffer>[],
    globalContext: AudioContext,
    bpm: number,
    selected: number | null,
    setSelected:React.Dispatch<React.SetStateAction<number | null>>,
    setTracks: React.Dispatch<React.SetStateAction<Track<AudioBuffer | MidiNoteSequence>[]>>,
    setBpm: React.Dispatch<React.SetStateAction<number | undefined>>,
    playAll: () => Promise<void>,

}

const  TrackView: React.FC<TrackViewProps> = ({tracks, bpm, selected, setSelected, setTracks, setBpm, playAll}) => {
    const [scheduledEvents, setScheduledEvents] = useState<number[]>([]);
    
    // const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const isPlayingUsed = useContext(isPlayingContext);
    const killDragOver = (e: React.DragEvent<HTMLDivElement>)=>{
        // console.log("YO YO");
        e.preventDefault();
        e.stopPropagation();

    }


  return (
    <div className='w-full bg-black h-full flex flex-col items-center'>
     
        <div className='w-full flex flex-row'>
            {/* <div className='w-full h-12 flex  flex-row'>
                <div className='w-1/12 bg-black'></div>
                <div className='w-11/12 bg-black overflow-x-scroll px-[10px]'>
                    {[...Array(100)].map((i, ix)=>(
                        <span key={ix}className={`mr-4 border-l-2 ${ix %4 ==0 ? "border-orange-400 border-l-2" : "border-gray-900"}`}></span>
                    ))}
                </div>
            </div> */}
            {/* <div ref={leftToggleRef} className='w-1/12'>
                {tracks.map((i, ix)=>{
                    return <div className='w-full h-28 bg-gray-900'>
                
                    </div>
                })}
            </div> */}
            <div  className='w-full ' onDrop={killDragOver}>
                {tracks.map((i, ix)=>{
                    return i.data instanceof AudioBuffer
                    ?
                    <Waveform bpm={bpm} i={i} ix={ix} selected={selected} setTracks={setTracks} setSelected={setSelected} key={ix}/>
                    :
                    <MidiForm setTracks={setTracks}i={i} ix={ix} selected={selected} setSelected={setSelected} key={ix}/>
                })}
            </div>

        </div>
    </div>
    )
}

export default TrackView 