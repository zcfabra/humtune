import React from 'react'
import { MidiNoteSequence } from '../typesandconsts';

import { TEMPOS, Track } from '../typesandconsts';
import * as Tone from "tone"
import { handleClientScriptLoad } from 'next/script';
import { INSTRUMENTMAP, instruments } from '../typesandconsts';

interface PanelProps{
    selected: number,
    tracks: Track<MidiNoteSequence| AudioBuffer>[],
    setTracks: React.Dispatch<React.SetStateAction<Track<MidiNoteSequence | AudioBuffer>[]>>,
}

const SynthPanel:React.FC<PanelProps> = ({selected, tracks, setTracks}) => {


    const handleSelectInstrument = (e: React.ChangeEvent<HTMLSelectElement>)=>{
        switch (e.target.value){
            case INSTRUMENTMAP.Synth:
                let instrument1 = new Tone.Synth().toDestination();
                instrument1.volume.value=-15;

                setTracks(prev=>{
                    prev[selected].soundMaker = instrument1
                    return [...prev];
                });
                break;
            case INSTRUMENTMAP.AMSynth:
                let instrument2 = new Tone.AMSynth().toDestination();
                instrument2.volume.value=-15;

                setTracks(prev=>{
                    prev[selected].soundMaker = instrument2
                    return [...prev]
                });
                break;
            case INSTRUMENTMAP.FMSynth:
                let instrument3 = new Tone.FMSynth().toDestination();
                instrument3.volume.value=-15;

                setTracks(prev=>{
                    prev[selected].soundMaker = instrument3
                    return [...prev]
                }); 
                break;

            case INSTRUMENTMAP.DuoSynth:
                let instrument4 = new Tone.DuoSynth().toDestination();
                instrument4.volume.value=-15;

                setTracks(prev=>{
                    prev[selected].soundMaker = instrument4
                    return [...prev]
                });
                break;
            case INSTRUMENTMAP.PluckSynth:
                let instrument5 = new Tone.PluckSynth().toDestination();
                instrument5.volume.value=-15;
                setTracks(prev=>{
                    prev[selected].soundMaker = instrument5
                    return [...prev]
                });
                break;

            case INSTRUMENTMAP.PolySynth:
                let instrument6 = new Tone.PolySynth().toDestination();
                instrument6.volume.value=-15;
                setTracks(prev=>{
                    prev[selected].soundMaker = instrument6
                    return [...prev]
                });
                break;
            case INSTRUMENTMAP.MetalSynth:
                let instrument7 = new Tone.MetalSynth().toDestination();
                instrument7.volume.value= -15;
                setTracks(prev=>{
                    prev[selected].soundMaker = instrument7
                    return [...prev]
                });
                break;
            case INSTRUMENTMAP.MembraneSynth:
                let instrument8 = new Tone.MembraneSynth().toDestination();
                instrument8.volume.value=-15;

                setTracks(prev=>{
                    prev[selected].soundMaker = instrument8
                    return [...prev]
                });
                break;
            case INSTRUMENTMAP.MonoSynth:
                let instrument9 = new Tone.MonoSynth().toDestination();
                instrument9.volume.value=-15;

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
        console.log(e.target.value)
        setTracks(prev=>{
            prev[selected].timesToLoop = Number(e.target.value);
            return [...prev]
        })
    }

    const handleVolumeChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        setTracks(prev=>{
            prev[selected].soundMaker.volume.value = Number(e.target.value);
            return [...prev];
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
            <select className='text-black h-12 rounded-md w-6/12' onChange={handleSelectTempo} value={Object.keys(TEMPOS).find(key => TEMPOS[key as keyof object] === tracks[selected].tempo)} name="" id="">
                {Object.keys(TEMPOS).map((i, ix)=>(
                    <option key = {ix}value={i}>{i}</option>
                )
                )}

            </select>
            <span>Loop</span>
            <select value={tracks[selected].timesToLoop}  className='text-black rounded-md w-6/12 h-12' onChange={handleSetBars} name="" id="">
                {
                [...Array(8)].map((i, ix)=>(
                    <option value={i} key={ix}>{ix + 1}</option>
                ))
            }
            </select>
            <span>Volume</span>
            <input onChange={handleVolumeChange} type="range" max={0} min={-30} step={0.1} value={tracks[selected].soundMaker.volume.value}/>
        </div>
    )
}

export default SynthPanel;