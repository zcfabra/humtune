import React from 'react'
export type MidiNoteSequence={
    data: (string | null)[],
    readonly duration: number;
    // readonly length: number;
    // readonly numberOfChannels: number;
    // readonly sampleRate: number;
}
interface MidiFormProps{
    ix: number,
    selected: number | null,
    setSelected: React.Dispatch<React.SetStateAction<number | null>>,
    i: MidiNoteSequence,
}

const MidiForm:React.FC<MidiFormProps> = ({ix, selected, setSelected, i}) => {
  return (
     <div key={ix}className='w-full h-28 bg-gray-900 flex flex-row items-center'>
    <div className='w-1/12 h-full bg-gray-900 text-white p-4 flex flex-col'>
        {/* <span className='mx-2'>{i.duration}</span> */}
        <div className='flex flex-row'>
            <button className='mx-2 rounded-md bg-gray-800 w-8 h-8'>M</button>
            <button className='mx-2 rounded-md bg-gray-800 w-8 h-8'>S</button>
        </div>
       

    </div>
    <div className='w-11/12 bg-black h-full border border-gray-900'>
        <div onClick={()=>setSelected(prev=>prev == ix ? null : ix)} style={{width: `${Math.floor(i.duration) * 100}px`}} className={`h-full cursor-pointer  ${selected == ix ?"bg-purple-500" : "bg-orange-500"}`}>
            <svg className={`w-full stroke-black`}>
                <path strokeWidth={2} d=""></path>
            </svg>       
        </div>
    </div>
    {/* <div key={ix} onClick={()=>setSelected(prev=>prev == ix ? null : ix)} className={`h-16 rounded-md cursor-pointer ${selected == ix ? "bg-purple-500" : "bg-orange-400"} ${selected==ix ? "border-purple-300" : "border-orange-300"} border-2 `} style={{width: `${i.length % 1000}px`}}>{JSON.stringify(i.length)}</div> */}
</div>
)

}

export default MidiForm