
import React, { useEffect, useState } from 'react'
import { generatePathData } from '../drawwaveform';
import { Track } from '../typesandconsts';
interface WaveformProps{
    i: Track<AudioBuffer>,
    ix: number,
    selected: number | null,
    setSelected: React.Dispatch<React.SetStateAction<number | null>>,

}
const Waveform: React.FC<WaveformProps> = ({i, setSelected, ix, selected}) => {

    const handleWaveform = ()=>{
        const drawnData = generatePathData(i.data as AudioBuffer);
        setPathData(drawnData);

    }
    const [pathData, setPathData] = useState<string>("");

    useEffect(()=>{
        handleWaveform();
    }, [])

  return (
    <div key={ix}className='w-full h-28 bg-gray-900 flex flex-row items-center'>
    <div className='w-1/12 h-full bg-gray-900 text-white p-4 flex flex-col'>
        {/* <span className='mx-2'>{i.duration}</span> */}
        <div className='flex flex-row'>
            <button className='mx-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-all w-8 h-8'>M</button>
            <button className='mx-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-all w-8 h-8'>S</button>
        </div>
       

    </div>
    <div className='w-11/12 bg-black h-full border border-gray-900'>
        <div onClick={()=>setSelected(prev=>prev == ix ? null : ix)} style={{width: `${Math.floor(i.data.duration) * 100}px`}} className={`h-full cursor-pointer  ${selected == ix ?"bg-purple-500" : "bg-orange-500"} flex flex-row `}>
            <svg className={`w-full stroke-black`}>
                <path strokeWidth={2} d={pathData}></path>
            </svg>       
            <div className='h-full w-[3px] bg-gray-900 cursor-col-resize'></div>
        </div>
    </div>
    {/* <div key={ix} onClick={()=>setSelected(prev=>prev == ix ? null : ix)} className={`h-16 rounded-md cursor-pointer ${selected == ix ? "bg-purple-500" : "bg-orange-400"} ${selected==ix ? "border-purple-300" : "border-orange-300"} border-2 `} style={{width: `${i.length % 1000}px`}}>{JSON.stringify(i.length)}</div> */}
</div>
  )
}

export default Waveform 