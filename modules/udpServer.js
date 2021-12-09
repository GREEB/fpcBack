import dgram from 'dgram';
import { throttledWrite } from './data.js';
import { makeUDPuser } from './user.js';

const udpServer = dgram.createSocket('udp4');

// const addK2R = async (ip) =>{

//     await redisClient.set(ip.toString(), Date.now().toString(), {
//         EX: 10,
//         NX: true
//       });

//     await publisher.publish('', 'message');

// }

udpServer.on('message', (msg, rinfo) => {
  const ip = rinfo.address;
  let userID;
  if (rinfo !== undefined) {
    userID = Math.round(ip.split('.').reduce((a, b) => a + b, 0) * Math.PI);
    makeUDPuser(rinfo.address, userID);
  }
  // important to tag data by user so if we have a bad actor its ez to remove
  // addK2R(rinfo.address)
  // console.log(udpclients);
  // Build list of clients to watch for changes
  // watchedudp[rinfo.address] = true;
  // await client.HGETALL('key');
  let flying = 1;
  let surface = 0;
  // Road edgde detection build in?
  // WheelOnRumbleStripFl(this byte[] bytes) { return GetSingle(bytes, 116)

  // Get Dirt tele to see if not on real road
  // SurfaceRumbleRr(this byte[] bytes) { return GetSingle(bytes, 160)
  const srFL = parseFloat(msg.readFloatLE(148));
  const srFR = parseFloat(msg.readFloatLE(152));
  const srRL = parseFloat(msg.readFloatLE(156));
  const srRR = parseFloat(msg.readFloatLE(160));

  // If all 4 Wheels are in a puddle add as water point
  // public static float WheelInPuddleRr(this byte[] bytes) { return GetSingle(bytes, 144)
  const wipFL = parseInt(msg.readFloatLE(132), 10);
  const wipFR = parseInt(msg.readFloatLE(136), 10);
  const wipRL = parseInt(msg.readFloatLE(140), 10);
  const wipRR = parseInt(msg.readFloatLE(144), 10);

  // Get suspension to check if wheel in the air?
  // public static float NormSuspensionTravelRr(this byte[] bytes) { return GetSingle(bytes, 80)
  const nstFL = parseFloat(msg.readFloatLE(68)).toFixed(1);
  const nstFR = parseFloat(msg.readFloatLE(72)).toFixed(1);
  const nstRL = parseFloat(msg.readFloatLE(76)).toFixed(1);
  const nstRR = parseFloat(msg.readFloatLE(80)).toFixed(1);

  // Car XYZ
  // public static float PositionZ(this byte[] bytes) { return GetSingle(bytes, 240 + BufferOffset)
  const x = parseFloat(msg.readFloatLE(232 + 12)).toFixed(1);
  const y = parseFloat(msg.readFloatLE(236 + 12)).toFixed(1);
  const z = parseFloat(msg.readFloatLE(240 + 12)).toFixed(1);

  flying = parseFloat(nstFL) + parseFloat(nstFR) + parseFloat(nstRL) + parseFloat(nstRR);

  if (wipFL + wipFR + wipRL + wipRR === 4) {
    surface = 2;
  } else if (srFL !== 0 && srFR !== 0 && srRL !== 0 && srRR) {
    surface = 1;
  } else {
    surface = 0;
  }

  // TODO: Throttle write for each client
  throttledWrite(x, y, z, surface, flying, rinfo.address, rinfo.size, userID);
});

udpServer.on('error', (err) => {
  console.log(`udpServer error:\n${err.stack}`);
  udpServer.close();
});

udpServer.on('close', (err) => {
  console.log(`udpServer error:\n${err}`);
});
udpServer.on('listening', () => {
  const address = udpServer.address();
  console.log(`udpServer listening ${address.address}:${address.port}`);
});
udpServer.bind(5300);

export default { udpServer };
