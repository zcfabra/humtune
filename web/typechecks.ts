import { MidiNoteSequence } from "./components/midiform"
import { Track } from "./components/trackview";
export const isMidiSequence = (x: Track<any>): boolean =>{
    if (x == undefined) {
        return false;
    }
    if (!( "data" in x.data)){
        return false;
    } 
    if (!("duration" in x.data)){
        return false
    }
    return true
}