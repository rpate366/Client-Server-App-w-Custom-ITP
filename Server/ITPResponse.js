let fs = require('fs')

let packet = ""

module.exports = {
    resource: null, //file in question
    header: [
        "00000000", //start of the last row
        "00000000",
        "00000000",
        "00000000",
        "00000000", //start of the second row
        "00000000",
        "00000000",
        "00000000",
        "00000000", //start of the third row
        "00000000",
        "00000000",
        "00000000",
      ],
    init: function (resource, sequence, timestamp, response) { // feel free to add function parameters as needed
        this.resource = resource
        
        let version = 7;
        storeBitPacket(this.header, version, 0, 4); //add version

        storeBitPacket(this.header, response, 4, 8);//add response

        storeBitPacket(this.header, sequence, 12, 20);//add sequence

        storeBitPacket(this.header, timestamp, 32, 32);//add timestamp

        img= fs.readFileSync("./images/" + resource)
        //take image data in binary, transform magically to a readable array
        this.payload = Buffer.from(img, "binary").toJSON().data;

        storeBitPacket(this.header, this.payload.length, 64, 32); //add image data length
    },

    //--------------------------
    //getpacket: returns the entire packet
    //--------------------------
    getPacket: function () {

        //make packet, concat header array and image data array
        packet = this.header.concat(addPayload(this.resource))
        let buffer = Buffer.from(packet) //make buffer to put through socket
        return buffer
    }
};

//for adding image data
function addPayload(resource) {
    resource = fs.readFileSync("./images/" + resource)
    
    resource = Buffer.from(resource, "binary").toJSON().data 

    return resource
}

//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Store integer value into specific bit poistion the packet
function storeBitPacket(packet, value, offset, length) {
    // let us get the actual byte position of the offset
    let lastBitPosition = offset + length - 1;
    let number = value.toString(2);
    let j = number.length - 1;
    for (var i = 0; i < number.length; i++) {
        let bytePosition = Math.floor(lastBitPosition / 8);
        let bitPosition = 7 - (lastBitPosition % 8);
        if (number.charAt(j--) == "0") {
            packet[bytePosition] &= ~(1 << bitPosition);
        } else {
            packet[bytePosition] |= 1 << bitPosition;
        }
        lastBitPosition--;
    }
}