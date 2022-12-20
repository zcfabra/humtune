
import React, { useEffect, useRef, useState } from 'react'
import { MidiNoteSequence, notesMap, tempoWidth } from '../typesandconsts';

import { Track } from '../typesandconsts';
interface MidiFormProps{
    ix: number,
    selected: number | null,
    setSelected: React.Dispatch<React.SetStateAction<number | null>>,
    i: Track<MidiNoteSequence>,
    setTracks: React.Dispatch<React.SetStateAction<Track<AudioBuffer | MidiNoteSequence>[]>>;
}
const MidiForm:React.FC<MidiFormProps> = ({ix, selected, setSelected, i, setTracks}) => {
    const [firstDragPoint, setFirstDragPoint] = useState<number| null>(null);
    const [xBoundTrack, setXBoundTrack] = useState<number>();
    const trackRef = useRef<HTMLDivElement>(null);


    useEffect(()=>{
        setXBoundTrack(trackRef!.current!.getBoundingClientRect().x);
    }, [ trackRef]);

    const generatePathData = (seq: MidiNoteSequence): string=>{
        let out = "";
        let h = 10
        let w = 0;
        // console.log("IDATA:", seq.data)
        for (let bar = 0; bar < i.timesToLoop!; bar++){

        
            for (let x of seq.data){
                if (x != null){
                    let y = h + notesMap.get(x)! * 1.8;
                    out+=`M ${w},${y}`+`L${w+18 / (16/tempoWidth[i.tempo as keyof object])}, ${y}` 
                }
                w+=18 / (16/ tempoWidth[i.tempo as keyof object]);
            }
        }


        return out;
    }
    const handleDrawPath = (i: MidiNoteSequence)=>{
        const pathData = generatePathData(i)
        return pathData
    };
    const roundToNearest = (n: number, toRound: number)=>{
        
        return Math.round(toRound / n) * n;
    };
    // var img = new Image();
    // img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=';
    const handleDragTrack = (e: React.DragEvent<HTMLDivElement>)=>{
    
        // e.dataTransfer.setDragImage(img, 0,0);
        // console.log("FIRST DRAG POINT",firstDragPoint);
        // console.log("XBOUND: ", xBoundTrack);
        // console.log("PAGEX", e.pageX)

        if (firstDragPoint == null){
            setFirstDragPoint(e.pageX);
        } else {
            let diff = e.pageX - (firstDragPoint - xBoundTrack!);
            // console.log("DIFF: ",diff);
            let rounded = roundToNearest(18, diff);
            setTracks(prev=>{
                prev[ix].edits.offsetFromStart =  diff >=0 ? rounded: 0;
                return [...prev]
            })
        }

    };

    const handleDragEndReset = (e: React.DragEvent<HTMLDivElement>)=>{
        e.preventDefault();
        setFirstDragPoint(null);
        setXBoundTrack(trackRef.current?.getBoundingClientRect().x);

    }
  

    return (
        <div key={ix} className='w-full h-20 bg-gray-900 flex flex-row items-center'>
       
        <div className='relative w-full bg-black h-full border-b border-gray-900'>
            <div ref={trackRef} draggable onDragEnd={handleDragEndReset} onDrag={handleDragTrack} onClick={()=>setSelected(prev=>prev == ix ? null : ix)} style={{marginLeft: `${i.edits.offsetFromStart}px`,width: `${ (i.timesToLoop! * (18 * tempoWidth[i.tempo as keyof object]) + 1)}px`}} className={`h-full flex flex-row cursor-pointer  ${selected == ix ?"bg-purple-500" : "bg-orange-500"}`}>
                <svg className={`w-full stroke-black`}>
                    <path strokeWidth={3} d={handleDrawPath(i.data as MidiNoteSequence)}></path>
                </svg>    
            </div>
        </div>
        {/* <div key={ix} onClick={()=>setSelected(prev=>prev == ix ? null : ix)} className={`h-16 rounded-md cursor-pointer ${selected == ix ? "bg-purple-500" : "bg-orange-400"} ${selected==ix ? "border-purple-300" : "border-orange-300"} border-2 `} style={{width: `${i.length % 1000}px`}}>{JSON.stringify(i.length)}</div> */}
    </div>
)

}

export default MidiForm