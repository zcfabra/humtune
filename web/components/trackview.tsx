
import React, { useEffect, useRef, useState } from 'react'
import { generatePathData } from '../drawwaveform';
import MidiForm, { MidiNoteSequence } from './midiform';
import Waveform from './waveform';
import * as Tone from "tone"
import { NoteSequence, sequenceProtoToMidi } from '@magenta/music';
import { DEFAULT_SAMPLE_RATE } from '../pages';
import { isMidiSequence } from '../typechecks';

export interface Track<T>{
    data: AudioBuffer | MidiNoteSequence,
    soundMaker: Tone.Synth | Tone.AMSynth | Tone.FMSynth | Tone.PolySynth | Tone.MetalSynth | Tone.MembraneSynth | Tone.PluckSynth | Tone.DuoSynth | Tone.NoiseSynth | Tone.Player,
}

interface TrackViewProps {

    tracks: Track<MidiNoteSequence | AudioBuffer>[],
    globalContext: AudioContext,
    bpm: number,
    selected: number | null,
    setSelected:React.Dispatch<React.SetStateAction<number | null>>
}

const  TrackView: React.FC<TrackViewProps> = ({tracks, globalContext, bpm, selected, setSelected}) => {

   
    const [currentMix, setCurrentMix] = useState<AudioBufferSourceNode>()
    const masterMixRef = useRef<HTMLAudioElement>(null);
    
    const playAll = async ()=>{
        console.log("VOL: ",Tone.Destination.volume);
        Tone.start()
        Tone.Transport.stop()
        for (let track of tracks){
            if (track.data instanceof AudioBuffer) {
                (track.soundMaker as Tone.Player).buffer = new Tone.ToneAudioBuffer(track.data as AudioBuffer)

                console.log("ThING:",(track.soundMaker as Tone.Player).buffer)
                    Tone.Transport.scheduleOnce((time)=>{
                        console.log("HERE IN RECORDED:", time)
                        // player.sync()
                        console.log("Schedule callback called");
                        (track.soundMaker as Tone.Player).start(time).stop(time + track.data.duration);
                    }, 0);

            } else if (isMidiSequence(track)) {
                Tone.Transport.scheduleOnce((time)=>{
                    console.log("HERE IN SYNTH: ", time)
                    let offset = 0;
                    for (let note of (track.data as MidiNoteSequence).data){
                        if (note != null){
                            console.log("AR triggered");
                            (track.soundMaker as Tone.Synth).triggerAttackRelease(note, "32n", time + offset)
                        }
                        offset += 0.25;
                    }
                }, 0)
            }
        }    
        console.log("starting", Tone.context.state)
        await Tone.context.resume();
        await Tone.start();
        console.log("starting", Tone.context.state)
        Tone.Transport.start();
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
                <div className='w-11/12 bg-black overflow-x-scroll px-[10px]'>
                    {[...Array(100)].map((i, ix)=>(
                        <span key={ix}className={`mr-4 border-l-2 ${ix %4 ==0 ? "border-orange-400 border-l-2" : "border-gray-900"}`}></span>
                    ))}
                </div>
            </div>
            {tracks.map((i, ix)=>{
                return i.data instanceof AudioBuffer
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