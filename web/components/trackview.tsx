import React, { useRef } from 'react'

interface TrackViewProps {

    tracks: AudioBuffer[]
}

const  TrackView: React.FC<TrackViewProps> = ({tracks}) => {
    const masterMixRef = useRef<HTMLAudioElement>(null);
    const playAll = ()=>{

        const ctx = new AudioContext();

        let maxLen: number = 0;
        for (let track of tracks){
            if (track.length > maxLen){
                maxLen = track.length;
            }
        }
        let bufferSource = ctx.createBuffer(1, maxLen, tracks[0].sampleRate);

        let buffer = bufferSource.getChannelData(0);

        for (let i = 0; i < buffer.length; i++){
            for (let track of tracks){
                buffer[i] += track.getChannelData(0)[i];
            } 
        }

        let finalMix = ctx.createBufferSource();

        finalMix.buffer = bufferSource;
        finalMix.connect(ctx.destination);
        finalMix.start();

    }
  return (
    <div className='w-full bg-black h-full'>
        <audio src="" ref={masterMixRef}></audio>

        {tracks.map((i, ix)=>(
            <div className='h-16 bg-gray-900 border-gray-600 border-y' style={{width: `${i.length % 1000}px`}}>{JSON.stringify(i.length)}</div>
        ))}

        <button onClick={playAll}>Play All</button>

    </div>
    )
}

export default TrackView 