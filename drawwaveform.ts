


export const generatePathData = (audbuf: AudioBuffer) : string=>{
   const numChannels = audbuf.numberOfChannels;
   let channelsOut = [];
   for (let x = 0; x < numChannels; x++){
       channelsOut.push(audbuf.getChannelData(x));
   }
//    console.log("PRECHANNEL",channelsOut);
   const peaks = channelsOut.reduce<number[]>(
       
        (mergedPeaks, channelData, ...args)=>{
            // console.log("CLOSURE CHANNEL DATA:", channelData);
            // console.log("CLOSURE MERGEDPEAKS:", mergedPeaks);
            return _getPeaks(audbuf,channelData, mergedPeaks, ...args)
        },[]

    );


    return _svgPaths(peaks);
}

const _getPeaks= (audbuf: AudioBuffer, channelData:any, peaks:any, channelNumber:number, ...args:any): Array<any>=>{
    // console.log("PEAKS:",peaks)
    // console.log("CHANNEL DATA:", channelData);
    const count = ((audbuf.duration  )  ) *2 *18;
    const numSamps = audbuf.length / count;
    const sampStep = ~~(numSamps / 10) || 1;
    let mergedPeaks = Array.isArray(peaks) ? peaks : [];

    for (let p = 0; p < count; p++){
        const start = ~~(p * numSamps);
        const end = ~~(start + numSamps);
        let min = channelData[0];
        let max = channelData[0];

        for (let sampleIdx = start; sampleIdx < end; sampleIdx += sampStep){
            let value = channelData[sampleIdx];
            if (value > max){
                max = value;
            }
            if (value < min){
                min = value;
            }
        }

        if (channelNumber === 0 || max > peaks[2*p]){
            mergedPeaks[2*p] = max;
        }

        if (channelNumber === 0 || min < peaks[2*p+1]){
            mergedPeaks[2*p+1] = min;
        }
    }
    return mergedPeaks;
}

const _svgPaths = (peaks: any)=>{
   const totalPeaks = peaks.length; 
   let data = ""

//    console.log("PEAKS:", peaks)

   for (let p = 0; p < totalPeaks; p++){
    if (p%2 == 0){
        data+= ` M${~~(p / 2)}, ${peaks.shift()*60+34}`;
    } else {
        data += ` L${~~(p / 2)}, ${peaks.shift()*60 + 38}`
    }
   }
   return data;

}