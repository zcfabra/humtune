import React, { useContext } from 'react'
import { MidiNoteSequence } from '../typesandconsts';

import { TEMPOS, Track } from '../typesandconsts';
import * as Tone from "tone"
import { handleClientScriptLoad } from 'next/script';
import { INSTRUMENTMAP, instruments } from '../typesandconsts';
import { isPlayingContext } from '../pages';
import { stopTheWorld } from '../pages/index';

interface PanelProps{
    selected: number,
    tracks: Track<MidiNoteSequence| AudioBuffer>[],
    setTracks: React.Dispatch<React.SetStateAction<Track<MidiNoteSequence | AudioBuffer>[]>>,
    bpm: number,
}

const SynthPanel:React.FC<PanelProps> = ({selected, tracks, setTracks, bpm}) => {
    const isPlayingUsed = useContext(isPlayingContext);


    const handleSelectInstrument = (e: React.ChangeEvent<HTMLSelectElement>)=>{
        tracks[selected].soundMaker.dispose();
        stopTheWorld(tracks);
        isPlayingUsed.setIsPlaying(false);


        switch (e.target.value){
            case INSTRUMENTMAP.Synth:
                let instrument1 = new Tone.Synth().toDestination().sync();
                instrument1.volume.value=-15;

                setTracks(prev=>{
                    prev[selected].soundMaker = instrument1
                    return [...prev];
                });
                break;
            case INSTRUMENTMAP.AMSynth:
                let instrument2 = new Tone.AMSynth().toDestination().sync();
                instrument2.volume.value=-15;

                setTracks(prev=>{
                    prev[selected].soundMaker = instrument2
                    return [...prev]
                });
                break;
            case INSTRUMENTMAP.FMSynth:
                let instrument3 = new Tone.FMSynth().toDestination().sync();
                instrument3.volume.value=-15;

                setTracks(prev=>{
                    prev[selected].soundMaker = instrument3
                    return [...prev]
                }); 
                break;

            case INSTRUMENTMAP.DuoSynth:
                let instrument4 = new Tone.DuoSynth().toDestination().sync();
                instrument4.volume.value=-15;

                setTracks(prev=>{
                    prev[selected].soundMaker = instrument4
                    return [...prev]
                });
                break;
            // case INSTRUMENTMAP.PluckSynth:
            //     let instrument5 = new Tone.PluckSynth().toDestination().sync();
            //     instrument5.volume.value=-15;
            //     setTracks(prev=>{
            //         prev[selected].soundMaker = instrument5
            //         return [...prev]
            //     });
            //     break;

            // case INSTRUMENTMAP.PolySynth:
            //     let instrument6 = new Tone.PolySynth().toDestination().sync();
            //     instrument6.volume.value=-15;
            //     setTracks(prev=>{
            //         prev[selected].soundMaker = instrument6
            //         return [...prev]
            //     });
            //     break;
            // case INSTRUMENTMAP.MetalSynth:
            //     let instrument7 = new Tone.MetalSynth().toDestination().sync();
            //     instrument7.volume.value= -15;
            //     setTracks(prev=>{
            //         prev[selected].soundMaker = instrument7
            //         return [...prev]
            //     });
            //     break;
            case INSTRUMENTMAP.MembraneSynth:
                let instrument8 = new Tone.MembraneSynth().toDestination().sync();
                instrument8.volume.value=-15;

                setTracks(prev=>{
                    prev[selected].soundMaker = instrument8
                    return [...prev]
                });
                break;
            case INSTRUMENTMAP.MonoSynth:
                let instrument9 = new Tone.MonoSynth().toDestination().sync();
                instrument9.volume.value=-15;

                setTracks(prev=>{
                    prev[selected].soundMaker = instrument9
                    return [...prev]
                });
                break;
        }
    }


    const handleSelectTempo = (e: React.ChangeEvent<HTMLSelectElement>)=>{
        // console.log(e.target.value);
        setTracks(prev=>{
            prev[selected].tempo = TEMPOS[e.target.value as keyof object];
            (prev[selected].data as MidiNoteSequence).duration = (prev[selected] as Track<MidiNoteSequence>).timesToLoop! * Tone.Time(TEMPOS[e.target.value as keyof object]).toSeconds() * 16
            return [...prev]
        })
    }

    const handleSetBars = (e: React.ChangeEvent<HTMLSelectElement>)=>{
        // console.log(e.target.value)
        setTracks(prev=>{
            prev[selected].timesToLoop = Number(e.target.value);
            // (prev[selected].data as MidiNoteSequence).duration = Number(e.target.value) * Tone.Time(prev[selected].tempo).toSeconds() * 16;
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
        <div onDragOver={e=>e.preventDefault()} onDrop={e=>e.preventDefault()} className={`w-full overflow-y-auto text-white p-4 bg-black border-x border-gray-900 flex flex-col space-y-2 ${selected && tracks[selected].data instanceof AudioBuffer ? "h-full": "h-4/6"}`}>
            <span>Instrument</span>
            <select value={tracks[selected].soundMaker.name} onChange={handleSelectInstrument} className=" h-12 bg-black border border-gray-300 text-white  rounded-md w-8/12 px-2"name="" id="">
                {instruments.map((i,ix)=>(
                    <option key={ix} value={i}>{i}</option>
                ))}
            </select>
            <span>Tempo</span>
            <select className=' h-12 rounded-md w-8/12 bg-black border border-gray-300 text-white px-2' onChange={handleSelectTempo} value={Object.keys(TEMPOS).find(key => TEMPOS[key as keyof object] === tracks[selected].tempo)} name="" id="">
                {Object.keys(TEMPOS).map((i, ix)=>(
                    <option key = {ix}value={i}>{i}</option>
                )
                )}

            </select>
            <span>Loop</span>
            <select value={tracks[selected].timesToLoop}  className=' bg-black border border-gray-300 text-white rounded-md w-8/12 h-12 px-2' onChange={handleSetBars} name="" id="">
                {
                [...Array(16)].map((i, ix)=>(
                    <option value={i} key={ix}>{ix + 1}</option>
                ))
            }
            </select>
            <span>Volume</span>
            <input className='accent-purple-500 h-2 appearance-none bg-purple-900 rounded-md ' onChange={handleVolumeChange} type="range" max={0} min={-30} step={0.1} value={tracks[selected].soundMaker.volume.value}/>
        </div>
    )
}

export default SynthPanel;