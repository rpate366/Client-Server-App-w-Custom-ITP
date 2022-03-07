
// Some code need to be added here, that are common for the module)

module.exports = {
    timer: 0, //set default for timer and sequence
    sequence: 0,
    init: function() {
       this.sequence = Math.floor(Math.random() * 998 + 1) //randomize both timer and sequence for 1 to 999 range
       this.timer = Math.floor(Math.random() * 998 + 1)

       setInterval(() => {
           this.timer++ //increment timer

           if (this.timer == 2**32){ //reset if timer hits 2^32
               this.timer == 0
           } 
       }, 10) //interval set to 10ms
    },

    //--------------------------
    //getSequenceNumber: return the current sequence number + 1
    //--------------------------
    getSequenceNumber: function() {
        this.sequence++
        return this.sequence;
    },

    //--------------------------
    //getTimestamp: return the current timer value
    //--------------------------
    getTimestamp: function() {
        return this.timer;
    }


};