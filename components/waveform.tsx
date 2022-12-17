
import { RecordWithTtl } from 'dns';
import React, { useEffect, useRef, useState } from 'react'
import { generatePathData } from '../drawwaveform';
import { MidiNoteSequence, Track } from '../typesandconsts';
interface WaveformProps{
    i: Track<AudioBuffer>,
    ix: number,
    bpm: number,
    selected: number | null,
    leftToggleRef: React.RefObject<HTMLDivElement>,
    setSelected: React.Dispatch<React.SetStateAction<number | null>>,
    setTracks: React.Dispatch<React.SetStateAction<Track<AudioBuffer | MidiNoteSequence>[]>>

}
const Waveform: React.FC<WaveformProps> = ({i, setSelected, ix, selected, setTracks, bpm, leftToggleRef}) => {

    const handleWaveform = ()=>{
        const drawnData = generatePathData(i.data as AudioBuffer);
        setPathData(drawnData);
    }
    const [pathData, setPathData] = useState<string>("");
    const [xBoundResize, setXBoundResize] = useState<number>();
    const [xBoundTrack, setXBoundTrack] = useState<number>();
    const [flipped, setFlipped] = useState<boolean>(false);

    useEffect(()=>{
        handleWaveform();
        console.log("POP:",trackResizeRef.current?.getBoundingClientRect().x);
        setXBoundResize(trackRef.current?.getBoundingClientRect().width);
        setXBoundTrack(trackRef.current?.getBoundingClientRect().x);
    }, []);


    const trackResizeRef= useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const [firstDragPoint, setFirstDragPoint] = useState<number | null>(null);


    const handleDragTrimEnd = (e: React.DragEvent<HTMLDivElement>)=>{
        // let trim = e.pageX - xBoundResize!;
        let trim = e.pageX - (xBoundTrack! + xBoundResize!)
        console.log("TRIM: ",trim);
        console.log("X", trackResizeRef.current?.getBoundingClientRect().x);
        if (trim < 0) {

            setTracks(prev=>{
                if (typeof prev[ix].edits !== "undefined"){
                    prev[ix].edits!.trimEnd = trim; 
                }
                return [...prev]
            })

        }

    }

    const handleDragEndResetXBound = (e: React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault();
        console.log("RESET")
        // setXBoundResize(_=>trackResizeRef.current?.getBoundingClientRect().x);
        // setXBoundTrack(_=>i.edits.offsetFromStart);
        setXBoundTrack(trackRef.current?.getBoundingClientRect().x);
        setFirstDragPoint(null);
        setFlipped(true);
    }

    const handleMoveTrack = (e: React.DragEvent<HTMLDivElement>)=>{
        if (firstDragPoint == null) {
            setFirstDragPoint(e.pageX);
            return;
        }

        let diff =  e.pageX - firstDragPoint!;
        console.log("TRACK WIDTH", trackRef.current?.getBoundingClientRect().width);
        console.log("TOGGLE WIDTH",leftToggleRef.current?.getBoundingClientRect().width);
        console.log("CURSOR", e.pageX)
        console.log("FIRST DRAG", firstDragPoint)
        console.log("XBoundResize", xBoundResize);
        console.log("XBoundTrack", xBoundTrack)
        console.log("DIFF",diff)
        setTracks(prev=>{
            prev[ix].edits.offsetFromStart = e.pageX - (firstDragPoint - xBoundTrack!) - leftToggleRef.current?.getBoundingClientRect().width! ;
            return [...prev];
        })
    }

    const handleResizeDragEnd = (e: React.DragEvent<HTMLDivElement>)=>{
        setXBoundResize(_=>trackResizeRef.current?.getBoundingClientRect().x);
    }

    const killDragOverDefault = (e: React.DragEvent<HTMLDivElement>)=>{
        console.log("DRAG OVER")
        e.preventDefault();
    }

  return (
    <div key={ix}className='w-full h-28 bg-gray-900 flex flex-row items-center'>
    <div  onDragOver={killDragOverDefault}className='z-10 w-full bg-black h-full border border-gray-900 flex flex-row'>
        <div ref={trackRef}  draggable onDragEnd={handleDragEndResetXBound} onDrag={handleMoveTrack}  onClick={()=>setSelected(prev=>prev == ix ? null : ix)} style={{width: `${((i.data.duration) *2* 18) + i.edits!.trimEnd!}px`, marginLeft: `${i.edits.offsetFromStart}px`}} className={`h-full cursor-pointer  ${selected == ix ?"bg-purple-500" : "bg-orange-500"} flex resize flex-row `}>
            <svg className={`w-full stroke-black`}>
                <path strokeWidth={2} d={pathData}></path>
            </svg>       
        </div>
            <div ref={trackResizeRef} draggable onDrag={handleDragTrimEnd}   className='h-full z-20 w-[3px] bg-red-500 select-none cursor-col-resize'></div>
    </div>
</div>
  )
}

export default Waveform 