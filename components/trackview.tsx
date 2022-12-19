
import React, { useContext, useEffect, useRef, useState } from 'react'
import { generatePathData } from '../drawwaveform';
import { MidiNoteSequence, Track } from '../typesandconsts';
import Waveform from './waveform';
import * as Tone from "tone"
import { DEFAULT_SAMPLE_RATE, SynthPack, isPlayingContext } from '../pages';
import { isMidiSequence } from '../utils';
import MidiForm from './midiform';

export const stopTheWorld = (tracks: Track<AudioBuffer | SynthPack>[])=>{
    for (let track of tracks) {
        if (track.soundMaker instanceof Tone.Player) {
            (track.soundMaker as Tone.Player).stop();
        } else {
            if ((track.soundMaker as any).oscillator !== undefined) {
                (track.soundMaker as Tone.Synth).oscillator.stop();
            } else if ((track.soundMaker as any).voice1 !== undefined) {
                (track.soundMaker as Tone.DuoSynth).voice0.oscillator.stop();
                (track.soundMaker as Tone.DuoSynth).voice1.oscillator.stop();
            } else {
                console.log(track.soundMaker.get());
                console.log(track.soundMaker.numberOfInputs);
                console.log(track.soundMaker.numberOfOutputs);
                // Volume -> Gain

            }
        }
    }

    console.log("NOW IN PAUSE: ", Tone.Transport.now(), Tone.now());
    // for (let ev of scheduledEvents) {
    //     Tone.Transport.clear(ev);

    // };
    Tone.Transport.cancel(0);
    Tone.Transport.stop();
    Tone.Transport.seconds= 0 ;
    // isPlayingUsed.setIsPlaying(false);
    return;
}



interface TrackViewProps {
    tracks: Track<MidiNoteSequence | AudioBuffer>[],
    globalContext: AudioContext,
    bpm: number,
    selected: number | null,
    setSelected:React.Dispatch<React.SetStateAction<number | null>>,
    setTracks: React.Dispatch<React.SetStateAction<Track<AudioBuffer | MidiNoteSequence>[]>>
}

const  TrackView: React.FC<TrackViewProps> = ({tracks, bpm, selected, setSelected, setTracks}) => {
    const [scheduledEvents, setScheduledEvents] = useState<number[]>([]);
    
    // const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const isPlayingUsed = useContext(isPlayingContext);
    const playAll = async ()=>{
        Tone.Transport.seconds = Tone.Time(0).toSeconds();
        if (isPlayingUsed.isPlaying){
            stopTheWorld(tracks);
            isPlayingUsed.setIsPlaying(false);
            return;
            
        }
        


        let max = 0;
        for (let each of tracks){
            if (each.data.duration > max){
                max = each.data.duration;
            }
        }


        console.log("TIMES:\nTone.now():",Tone.now()," \n Tone.Transport():", Tone.Transport.now());
        console.log("Synced?",Tone.now() == Tone.Transport.now());
        for (let track of tracks){
            if (track.data instanceof AudioBuffer) {
                    let id = Tone.Transport.scheduleOnce((time)=>{

                        console.log("HERE IN RECORDED:");
                        let diff = Tone.Transport.now() - track.soundMaker.now();
                        console.log("DIFF: ", diff);
                        console.log("Time in callback: ",time);
                        console.log("Time of Tone.now()", Tone.now());
                        console.log("Time of Player.now()", track.soundMaker.now());
                        console.log("Time of Tone.Transport.now()", Tone.Transport.seconds);
                        let start_time = diff == 0 ? time : time - diff;
                        (track.soundMaker as Tone.Player).start(Tone.Time("4n").toSeconds() + Tone.Time((track.edits.offsetFromStart / 18/2)).toSeconds(), 0).stop(Tone.Time("4n").toSeconds() + Tone.Time((track.edits.offsetFromStart / 18 /2)+track.data.duration + (track.edits.trimEnd / 18 /2)).toSeconds());
                    }, 0);
                    setScheduledEvents(prev=>[...prev, id])

            } else if (isMidiSequence(track)) {
                let id = Tone.Transport.scheduleOnce((time)=>{
                    console.log("HERE IN SYNTH:");
                    let diff = Tone.Transport.now() - track.soundMaker.now();
                    console.log("DIFF: ", diff);

                    console.log("Time of callback", time);
                    console.log("Tone of Synth.now()", track.soundMaker.now());
                    console.log("Time of Tone.now()", Tone.now());
                    console.log("Time of Tone.Transport.now()", Tone.Transport.seconds);
                    let start_time = diff == 0 ? time : time - diff;

                    let offset = Tone.Time(0).toSeconds();

                    for (let bar = 0; bar < track.timesToLoop!; bar++){

                        for (let note of (track.data as MidiNoteSequence).data){
                            if (note != null){
                                (track.soundMaker as SynthPack).triggerAttackRelease(note, Tone.Time(track.tempo!).toSeconds(), Tone.Time("4n").toSeconds()+ offset);
                            }
                            offset += Tone.Time(track.tempo).toSeconds();
                        }
                    }
                }, 0)
                setScheduledEvents(prev=>[...prev, id])
            }
        };
        Tone.Transport.scheduleOnce(()=>{
            stopTheWorld(tracks);
            isPlayingUsed.setIsPlaying(false);
        }, 0 + Tone.Time(max).toSeconds() + Tone.Time("4n").toSeconds())
        console.log("starting", Tone.context.state)
        await Tone.context.resume();
        Tone.start();
        console.log("starting", Tone.context.state);
        isPlayingUsed.setIsPlaying(true);
        Tone.Transport.start();



    }

    const leftToggleRef = useRef<HTMLDivElement>(null);
  return (
    <div className='w-full bg-black h-full flex flex-col items-center'>
        <div className='w-full h-16 border-b border-black flex flex-row justify-center items-center'>
            <span className='text-white'>BPM: {bpm}</span>
              <button className='w-32 h-12 text-orange-500 rounded-md text-5xl' onClick={() => tracks.length > 0 && playAll()}>{!isPlayingUsed.isPlaying ? <span>&#9658;</span> : <span> &#9632;</span>}</button>
        </div>
        <div className='w-full flex flex-row'>
            {/* <div className='w-full h-12 flex  flex-row'>
                <div className='w-1/12 bg-black'></div>
                <div className='w-11/12 bg-black overflow-x-scroll px-[10px]'>
                    {[...Array(100)].map((i, ix)=>(
                        <span key={ix}className={`mr-4 border-l-2 ${ix %4 ==0 ? "border-orange-400 border-l-2" : "border-gray-900"}`}></span>
                    ))}
                </div>
            </div> */}
            <div ref={leftToggleRef} className='w-1/12'>
                {tracks.map((i, ix)=>{
                    return <div className='w-full h-28 bg-gray-900'>
                
                    </div>
                })}
            </div>
            <div  className='w-11/12 '>
                {tracks.map((i, ix)=>{
                    return i.data instanceof AudioBuffer
                    ?
                    <Waveform leftToggleRef={leftToggleRef}bpm={bpm} i={i} ix={ix} selected={selected} setTracks={setTracks} setSelected={setSelected} key={ix}/>
                    :
                    <MidiForm i={i} ix={ix} selected={selected} setSelected={setSelected} key={ix}/>
                })}
            </div>

        </div>
    </div>
    )
}

export default TrackView 