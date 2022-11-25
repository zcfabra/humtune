import React, { ReactText } from 'react'
import { MidiNoteSequence } from './midiform';
import { Track } from './trackview';
import * as Tone from "tone"
import { handleClientScriptLoad } from 'next/script';
import { div } from '@tensorflow/tfjs';

interface PanelProps{
    selected: number,
    tracks: Track<MidiNoteSequence| AudioBuffer>[],
    setTracks: React.Dispatch<React.SetStateAction<Track<MidiNoteSequence | AudioBuffer>[]>>,
}

const instruments = ["Synth", "AMSynth", "FMSynth", "DuoSynth", "MembraneSynth", "MetalSynth", "PluckSynth", "PolySynth", "MonoSynth"]

const INSTRUMENTMAP ={
    Synth: "Synth",
    AMSynth:"AMSynth",
    FMSynth: "FMSynth",
    DuoSynth: "DuoSynth",
    MembraneSynth: "MembraneSynth",
    MetalSynth: "MetalSynth",
    PluckSynth: "PluckSynth",
    PolySynth: "PolySynth",
    MonoSynth: "MonoSynth"
}

const Panel:React.FC<PanelProps> = ({selected, tracks, setTracks}) => {

    // const handleUpdateAttribute = (e: React.ChangeEvent<HTMLInputElement>) =>{
    //     console.log(e.target.value);

    //     // setTracks(prev=>{
    //     //     (prev[selected].soundMaker as Tone.Synth).envelope.set({[e.target.name]: Number(e.target.value)}); 
    //     //     return [...prev];
    //     // });

    // }

    const handleSelectInstrument = (e: React.ChangeEvent<HTMLSelectElement>)=>{
        switch (e.target.value){
            case INSTRUMENTMAP.Synth:
                let instrument_1 = new Tone.Synth().toDestination()
                setTracks(prev=>{
                    prev[selected].soundMaker = instrument_1
                    return [...prev];
                });
                break;
            case INSTRUMENTMAP.AMSynth:
                let instrument2 = new Tone.AMSynth().toDestination()
                setTracks(prev=>{
                    prev[selected].soundMaker = instrument2
                    return [...prev]
                });
                break;
            case INSTRUMENTMAP.FMSynth:
                let instrument3 = new Tone.FMSynth().toDestination();
                setTracks(prev=>{
                    prev[selected].soundMaker = instrument3
                    return [...prev]
                }); 
                break;

            case INSTRUMENTMAP.DuoSynth:
                let instrument4 = new Tone.DuoSynth().toDestination();
                setTracks(prev=>{
                    prev[selected].soundMaker = instrument4
                    return [...prev]
                });
                break;
            case INSTRUMENTMAP.PluckSynth:
                let instrument5 = new Tone.PluckSynth().toDestination();
                setTracks(prev=>{
                    prev[selected].soundMaker = instrument5
                    return [...prev]
                });
                break;

            case INSTRUMENTMAP.PolySynth:
                let instrument6 = new Tone.PolySynth().toDestination();
                setTracks(prev=>{
                    prev[selected].soundMaker = instrument6
                    return [...prev]
                });
                break;
            case INSTRUMENTMAP.MetalSynth:
                let instrument7 = new Tone.MetalSynth().toDestination();
                setTracks(prev=>{
                    prev[selected].soundMaker = instrument7
                    return [...prev]
                });
                break;
            case INSTRUMENTMAP.MembraneSynth:
                let instrument8 = new Tone.MembraneSynth().toDestination();
                setTracks(prev=>{
                    prev[selected].soundMaker = instrument8
                    return [...prev]
                });
                break;
        }
    }
    return (
        <div className={`w-full overflow-y-scroll  bg-black border-x border-gray-900 flex flex-col ${selected && tracks[selected].data instanceof AudioBuffer ? "h-full": "h-4/6"}`}>
            <select value={tracks[selected].soundMaker.name} onChange={handleSelectInstrument} className=" h-12  rounded-md w-6/12"name="" id="">
                {instruments.map((i,ix)=>(
                    <option value={i}>{i}</option>
                ))}
            </select>
        </div>
    )
}

export default Panel;