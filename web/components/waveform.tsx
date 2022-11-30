
import React, { useEffect, useRef, useState } from 'react'
import { generatePathData } from '../drawwaveform';
import { MidiNoteSequence, Track } from '../typesandconsts';
interface WaveformProps{
    i: Track<AudioBuffer>,
    ix: number,
    bpm: number,
    selected: number | null,
    setSelected: React.Dispatch<React.SetStateAction<number | null>>,
    setTracks: React.Dispatch<React.SetStateAction<Track<AudioBuffer | MidiNoteSequence>[]>>

}
const Waveform: React.FC<WaveformProps> = ({i, setSelected, ix, selected, setTracks, bpm}) => {

    const handleWaveform = ()=>{
        const drawnData = generatePathData(i.data as AudioBuffer);
        setPathData(drawnData);

    }
    const [pathData, setPathData] = useState<string>("");
    const [xBound, setXBound] = useState<number>();

    useEffect(()=>{
        handleWaveform();
        console.log("POP:",trackRef.current?.getBoundingClientRect().x);
        setXBound(trackRef.current?.getBoundingClientRect().x);
    }, []);


    const trackRef= useRef<HTMLDivElement>(null);

    const handleDrag = (e: React.DragEvent<HTMLDivElement>)=>{
        let trim = e.pageX - xBound!;
        console.log("TRIM: ",trim);
        console.log("X", trackRef.current?.getBoundingClientRect().x);


        setTracks(prev=>{
            if (typeof prev[ix].edits !== "undefined"){
                prev[ix].edits!.trimEnd = trim
            }
            return [...prev]
        })


    }

    // const handleDragEndResetXBound = (e: React.DragEvent<HTMLDivElement>)=>{

    // }

  return (
    <div key={ix}className='w-full h-28 bg-gray-900 flex flex-row items-center'>
    <div className='w-full bg-black h-full border border-gray-900'>
        <div    onClick={()=>setSelected(prev=>prev == ix ? null : ix)} style={{width: `${((i.data.duration) *2* 18) + i.edits!.trimEnd!}px`}} className={`h-full cursor-pointer  ${selected == ix ?"bg-purple-500" : "bg-orange-500"} flex resize flex-row `}>
            <svg className={`w-full stroke-black`}>
                <path strokeWidth={2} d={pathData}></path>
            </svg>       
            <div ref={trackRef} draggable onDrag={handleDrag} className='h-full w-[3px] bg-transparent cursor-col-resize'></div>
        </div>
    </div>
</div>
  )
}

export default Waveform 