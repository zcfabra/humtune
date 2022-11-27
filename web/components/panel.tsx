import React, { ReactText } from 'react'
import { MidiNoteSequence } from './midiform';
import { TEMPOS, Track } from './trackview';
import * as Tone from "tone"
import { handleClientScriptLoad } from 'next/script';

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

const SynthPanel:React.FC<PanelProps> = ({selected, tracks, setTracks}) => {


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
            case INSTRUMENTMAP.MonoSynth:
                let instrument9 = new Tone.MonoSynth().toDestination();
                setTracks(prev=>{
                    prev[selected].soundMaker = instrument9
                    return [...prev]
                });
                break;
        }
    }


    const handleSelectTempo = (e: React.ChangeEvent<HTMLSelectElement>)=>{
        console.log(e.target.value);
        setTracks(prev=>{
            prev[selected].tempo = TEMPOS[e.target.value as keyof object];
            return [...prev]
        })
    }

    const handleSetBars = (e: React.ChangeEvent<HTMLSelectElement>)=>{
        setTracks(prev=>{
            prev[selected].bars = Number(e.target.value) + 1;
            return [...prev]
        })
    }
    return (
        <div className={`w-full overflow-y-scroll text-white p-4 bg-black border-x border-gray-900 flex flex-col ${selected && tracks[selected].data instanceof AudioBuffer ? "h-full": "h-4/6"}`}>
            <span>Instrument</span>
            <select value={tracks[selected].soundMaker.name} onChange={handleSelectInstrument} className=" h-12 text-black rounded-md w-6/12"name="" id="">
                {instruments.map((i,ix)=>(
                    <option key={ix} value={i}>{i}</option>
                ))}
            </select>
            <span>Tempo</span>
            <select className='text-black' onChange={handleSelectTempo} value={Object.keys(TEMPOS).find(key => TEMPOS[key as keyof object] === tracks[selected].tempo)} name="" id="">
                {Object.keys(TEMPOS).map((i, ix)=>(
                    <option key = {ix}value={i}>{i}</option>
                )
                )}

            </select>
            <span>Bars</span>
            <select className='text-black' onChange={handleSetBars} name="" id="">{
                [...Array(4)].map((i, ix)=>(
                    <option value={i} key={ix}>{ix + 1}</option>
                ))
            }</select>
        </div>
    )
}

export default SynthPanel;