let net = require("net");
let fs = require("fs");
let open = require("open");
let {exit} = require("process")

let ITPpacket = require("./ITPRequest"); // uncomment this line after you run npm install command

// Enter your code for the client functionality here

var argv = require('minimist')(process.argv.slice(2)) //contains arguements passed through the command line

/*
  argv["s"] will store <serverIP>:<port> 
  argv["q"] will store <image name> 
  argv["v"] will store <version>
*/



let serverPort = argv["s"].split(':') //[0] stores address, [1] stores port

let socket = new net.Socket()

let timer = Math.floor(Math.random() * 998) + 1

//increment timer
setInterval(() => {
  timer++

  if (timer == 2**32) timer = 0
}, 10)

//connect to socket
socket.connect({port: serverPort[1], host: serverPort[0]}, (err) => {
  if (err) throw err
  console.log("\nConnected to ImageDB server on: " + argv["s"])
})

//initialize a request
ITPpacket.init(argv["v"], argv["q"], timer)

//write request
socket.write(ITPpacket.getBytePacket())

socket.on('data', function(data) {
  if (data != "Invalid Request") {
    //header
    let header = data.toJSON().data.slice(0, 12)

    //the rest of the info following the header
    img = data.toJSON().data.slice(12, data.toJSON().data.length)

    //read parts of the header for each output
    let version = parseBitPacket(header, 0, 4)
    let responseType = parseBitPacket(header, 4, 8)
    switch (responseType) { //set responsetype depending on value
      case 0:
        responseType = "Query"
        break
      case 1:
        responseType = "Found"
        break
      case 2: 
        responseType = "Not Found"
        break
      case 3: 
        responseType = "Busy"
        break
    }

    let sequence = parseBitPacket(header, 12, 20)
    let timestamp = parseBitPacket(header, 32, 32)
    //god, so much stuff to log
    console.log("\nITP Packet header received: " + printPacketBit(header))

    console.log("\nServer Sent:" + 
    "\n\t--ITP Version: " + version +
    "\n\t--Response Type: " + responseType + 
    "\n\t--Sequence Number: " + sequence +
    "\n\t--Timestamp: " + timestamp)

    //create a buffer for the img
    const imgBuf = Buffer.from(img)

    //if it wasnt found, dont read buffer
    if (responseType != "Not Found") {
      //read buffer and open
      fs.writeFileSync(argv["q"], imgBuf);
      open(argv["q"], { wait: false });
    }

    //wait for image to load
    setTimeout(exit, 500)
  }
  //disconnect
  console.log("\nDisconnecting from the ImageDB server")
  socket.destroy()
})

socket.on("close", () => {
  //confirm socket close
  console.log("Connection Terminated")
})

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


  
