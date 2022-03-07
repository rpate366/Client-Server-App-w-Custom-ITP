// You may need to add some delectation here

let packet = ""

module.exports = {
  init: function (version, resource, timestamp) {

    //split into file name and image type
    let fileName = resource.split(".")[0]
    let imageType = resource.split(".")[1]

    //construct packet
    packet = addV(version) + addReserved() + 
      addQuery() + addTimestamp(timestamp) + 
      addImageType(imageType) +
      addFileNameSize(fileName) +
      addFileName(fileName)
    
  },

  //--------------------------
  //getBytePacket: returns the entire packet in bytes
  //--------------------------
  getBytePacket: function () {
    //return packet
    return packet;
  },
};

//adds the version
function addV(version) {
  version = version.toString(2)
  while (version.length < 4) {
    version = "0" + version
  }

  return version
}

//doesnt really do anything, just adds 20 zeroes
function addReserved() {
  let sequence = "0"
  while (sequence.length < 20){
    sequence = "0" + sequence
}
  return sequence
}

//tell server this is a query
function addQuery() {
  return "00000000"
}

//add clients timestamp
function addTimestamp(timestamp) {
  timestamp = timestamp.toString(2)
  while (timestamp.length < 32) {
      timestamp = "0" + timestamp
  }

  return timestamp 
}

//add image type case by case
function addImageType(iType) {
  if (iType == "jpeg") {
    return "0010"
  } else {
    return "0011"
  }
}

//size of image name
function addFileNameSize(fileS) {
  fileS = addFileName(fileS).length.toString(2)
  while (fileS.length < 28) {
    fileS = "0" + fileS
  }

  return fileS
}

//image name
function addFileName(fName) {
  fName = stringToBytes(fName)

  let output = ""
  //convert every letter to binary
  for (let i = 0; i < fName.length; i++) {
    let temp = fName[i].toString(2)
    
    while(temp.length < 8) {
      temp = "0" + temp
    }

    output += temp
  }

  return output
}


//// Some usefull methods ////
// Feel free to use them, but DO NOT change or add any code in these methods.

// Convert a given string to byte array
function stringToBytes(str) {
  var ch,
    st,
    re = [];
  for (var i = 0; i < str.length; i++) {
    ch = str.charCodeAt(i); // get char
    st = []; // set up "stack"
    do {
      st.push(ch & 0xff); // push byte to stack
      ch = ch >> 8; // shift value down by 1 byte
    } while (ch);
    // add stack contents to result
    // done because chars have "wrong" endianness
    re = re.concat(st.reverse());
  }
  // return an array of bytes
  return re;
}

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
