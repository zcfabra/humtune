import React, { useEffect, useRef, useState } from 'react'

interface TrackViewProps {

    tracks: AudioBuffer[],
    globalContext: AudioContext,
    bpm: number,
    selected: number | null,
    setSelected:React.Dispatch<React.SetStateAction<number | null>>
}

const  TrackView: React.FC<TrackViewProps> = ({tracks, globalContext, bpm, selected, setSelected}) => {



    
    const [currentMix, setCurrentMix] = useState<AudioBufferSourceNode>()
    const masterMixRef = useRef<HTMLAudioElement>(null);
    const playAll = async ()=>{

        globalContext.resume();
        console.log("1")

        let maxLen: number = 0;
        for (let track of tracks){
            if (track.length > maxLen){
                maxLen = track.length;
            }
        }
        console.log("2")
        let bufferSource = globalContext.createBuffer(1, maxLen, tracks[0].sampleRate);
        console.log("3")
        let buffer = bufferSource.getChannelData(0);
        console.log("4")
        for (let track of tracks){
                let trackBuffer = track.getChannelData(0);
                for (let i = 0; i < trackBuffer.length; i++){
                    buffer[i] += trackBuffer[i];
                }
            console.log("5") 
            }    
        
        
        console.log("6")

        let finalMix = globalContext!.createBufferSource();
        console.log("7")
        finalMix.buffer = bufferSource;
        console.log("8")
        finalMix.connect(globalContext.destination);
        console.log("9")
        await globalContext.resume();
        setCurrentMix(finalMix);
        finalMix.start();
        console.log("Got here")

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
                <div className='w-11/12 bg-black flex flex-row'>
                    {[...Array(100)].map((i, ix)=>(
                        <span className={`w-[20px] border-l-2 ${ix %4 ==0 ? "border-orange-400 border-l-4" : "border-gray-900"}`}></span>
                    ))}
                </div>
            </div>
            {tracks.map((i, ix)=>(
                <div className='w-full h-28 bg-gray-900 flex flex-row items-center'>
                    <div className='w-1/12 h-full bg-gray-900 text-white'>
                        <span>{i.duration}</span>
                    </div>
                    <div className='w-11/12 bg-black h-full border border-gray-900'>
                        <div onClick={()=>setSelected(prev=>prev == ix ? null : ix)} style={{width: `${Math.floor(i.duration) * 100}px`}} className={`h-full cursor-pointer  ${selected == ix ? "bg-purple-500" : "bg-orange-500"}`}></div>
                    </div>
                    {/* <div key={ix} onClick={()=>setSelected(prev=>prev == ix ? null : ix)} className={`h-16 rounded-md cursor-pointer ${selected == ix ? "bg-purple-500" : "bg-orange-400"} ${selected==ix ? "border-purple-300" : "border-orange-300"} border-2 `} style={{width: `${i.length % 1000}px`}}>{JSON.stringify(i.length)}</div> */}
                </div>
            ))}

        </div>
    </div>
    )
}

export default TrackView 