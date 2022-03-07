const { Socket } = require('dgram');
let ITPpacket = require('./ITPResponse');
let singleton = require('./Singleton');

// You may need to add some delectation here

module.exports = {

    handleClientJoining: function (sock) {
        sock.on('data', function(data) {
            //translate data
            data = dividePacket(data)  // data => timestamp, img type, image name size, image name, version, request type, data in string format
            
            //get name
            let resource = getResourceName(data[1], data[3])

            //ignore if request type isnt query or version isnt 7
            if (data[5] != "Query" || data[4] != 7) {
                console.log(data[5], data[4])
                sock.write("Invalid Request")
                return
            }

            //loglogloglog
            console.log("\nClient-" + singleton.getTimestamp() + " has connected at timestamp: " + singleton.getTimestamp())
            console.log("\nITP Packet received: ")
            console.log(data[6])
            console.log("\nClient-" + singleton.getTimestamp() + " Requests: ")
            console.log("\t--ITP version: " + data[4])
            console.log("\t--Timestamp: " + data[0])
            console.log("\t--Request Type: " + data[5])
            console.log("\t--Image file extension(s): " + resource.split(".")[1])
            console.log("\t--Image file name: " + resource.split(".")[0])

            //see if we have the file
            let response = 3
            if ((resource == "BleedingHeart.gif") || 
            (resource == "CallaLily.gif") ||
            (resource == "Canna.gif") ||
            (resource == "Cardinal.jpeg") ||
            (resource == "CherryBlossom.gif") ||
            (resource == "Flamingo.jpeg") ||
            (resource == "Flicker.jpeg") ||
            (resource == "Parrot.jpeg") ||
            (resource == "Rose.gif") ||
            (resource == "Swan.jpeg")){
                response = 1 //1 means found
            } else { //set response to not found
                response = 2
                sock.write("Invalid Request")//decline the clients request
                return
            }

            //create response packet
            ITPpacket.init(resource, singleton.getSequenceNumber(), singleton.getTimestamp(), resource)

            //send response
            sock.write(ITPpacket.getPacket())
            sock.pipe(sock)
        })

        //declare client leaving
        sock.on("close", function() {
            console.log("\nClient Terminated the Connection")
        })
    }
};

function getResourceName(imageType, imageName) {
    //get type in a decimal number
    imageType = parseInt(imageType, 2)

    //cases for potential image type
    switch (imageType){
        case 1:
          imageType = ".bmp";
          break;
        case 2:
          imageType = ".jpeg";
          break;
        case 3:
          imageType = ".gif";
          break;
        case 4:
          imageType = ".png";
          break;
        case 5:
          imageType = ".tiff";
          break;
        case 15:
          imageType = ".raw";
          break;
    }
    
    //convert binary to letters
    let tmp = ""
    for (let i = 0; i < Math.floor(imageName.length / 8); i++) {
        tmp += String.fromCharCode(parseInt(imageName.slice(i * 8, (i + 1) * 8), 2)) //get the 8 bit slice, parse to int, convert to string
    }

    //return full name ex. ThisIsAGreatApplication.raw
    return tmp + imageType
}

//divide up the packet into an array containing sectioned off info
function dividePacket(packet) {
    packet = packet.toString()
    let data = []
    data.push(parseInt(packet.slice(32, 64), 2)) //timestamp
    data.push(packet.slice(64, 68)) //img type
    data.push(packet.slice(68, 96)) //name size

    let nameSize = parseInt(data[2], 2) //find length of name
    data.push(packet.slice(96, 96 + nameSize)) //img name

    data.push(parseInt(packet.slice(0, 4), 2)) //version

    let request = parseInt(packet.slice(24, 32), 2)//get request as number
    if (request == 0) {
        request = "Query"
    } else {
        request = "Not Understood"
    }

    data.push(request) //request type

    //header but formatted
    let dataString = ""
    for (let i = 0; i < packet.length; i++) {
        if (i % 32 == 0 && i != 0) {
            dataString += "\n" //add a new line before every 32 bits
        }
        if (i % 8 == 0) {
            dataString += " " //space out every 8 bits
        }

        dataString += packet[i] //add to final string
    }

    data.push(dataString) //header formatted

    return data //returns array
}

//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Returns the integer value of the extracted bits fragment for a given packet
function parseBitPacket(packet, offset, length) {
    let number = "";
    for (var i = 0; i < length; i++) {
        // let us get the actual byte position of the offset
        let bytePosition = Math.floor((offset + i) / 8);
        let bitPosition = 7 - ((offset + i) % 8);
        let bit = (packet[bytePosition] >> bitPosition) % 2;
        number = (number << 1) | bit;
    }
    return number;
}

// Prints the entire packet in bits format
function printPacketBit(packet) {
    var bitString = "";

    for (var i = 0; i < packet.length; i++) {
        // To add leading zeros
        var b = "00000000" + packet[i].toString(2);
        // To print 4 bytes per line
        if (i > 0 && i % 4 == 0) bitString += "\n";
        bitString += " " + b.substr(b.length - 8);
    }
    console.log(bitString);
}

// Converts byte array to string
function bytesToString(array) {
    var result = "";
    for (var i = 0; i < array.length; ++i) {
        result += String.fromCharCode(array[i]);
    }
    return result;
}