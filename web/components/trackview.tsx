
import React, { useEffect, useRef, useState } from 'react'
import { generatePathData } from '../drawwaveform';
import { MidiNoteSequence, Track } from '../typesandconsts';
import Waveform from './waveform';
import * as Tone from "tone"
import { DEFAULT_SAMPLE_RATE, SynthPack } from '../pages';
import { isMidiSequence } from '../utils';
import MidiForm from './midiform';



interface TrackViewProps {
    tracks: Track<MidiNoteSequence | AudioBuffer>[],
    globalContext: AudioContext,
    bpm: number,
    selected: number | null,
    setSelected:React.Dispatch<React.SetStateAction<number | null>>
}

const  TrackView: React.FC<TrackViewProps> = ({tracks, bpm, selected, setSelected}) => {

    const playAll = async ()=>{
        
        
        Tone.Transport.stop();
        Tone.Transport.position = "0:0:0";
        console.log("Transport Position:", Tone.Transport.position);


        let max = 0;
        for (let each of tracks){
            if (each.data.duration > max){
                max = each.data.duration;
            }
        }


        console.log("TIMES:\nTone.now():",Tone.now()," \n Tone.Transport():", Tone.Transport.now());
        console.log(Tone.now() == Tone.Transport.now());
        for (let track of tracks){
            if (track.data instanceof AudioBuffer) {
                    Tone.Transport.scheduleOnce((time)=>{

                        console.log("HERE IN RECORDED:");
                        let diff = Tone.Transport.now() - track.soundMaker.now();
                        console.log("DIFF: ", diff);
                        console.log("Time in callback: ",time);
                        console.log("Time of Tone.now()", Tone.now());
                        console.log("Time of Player.now()", track.soundMaker.now());
                        console.log("Time of Tone.Transport.now()", Tone.Transport.now());
                        let start_time = diff == 0 ? time : time - diff;
                        (track.soundMaker as Tone.Player).start(start_time).stop(start_time + track.data.duration);
                    }, 0);

            } else if (isMidiSequence(track)) {
                Tone.Transport.scheduleOnce((time)=>{
                    console.log("HERE IN SYNTH:");
                    let diff = Tone.Transport.now() - track.soundMaker.now();
                    console.log("DIFF: ", diff);

                    console.log("Time of callback", time);
                    console.log("Tone of Synth.now()", track.soundMaker.now());
                    console.log("Time of Tone.now()", Tone.now());
                    console.log("Time of Tone.Transport.now()", Tone.Transport.now());
                    let start_time = diff == 0 ? time : time - diff;

                    let offset = 0;

                    for (let note of (track.data as MidiNoteSequence).data){
                        if (note != null){
                            (track.soundMaker as Tone.Synth).triggerAttackRelease(note, track.tempo!, start_time+ offset);
                        }
                        offset += Tone.Time(track.tempo).toSeconds();
                    }
                }, 0)
            }
        }    
        console.log("starting", Tone.context.state)
        await Tone.context.resume();
        Tone.start();
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