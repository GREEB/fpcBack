import throttle from 'lodash.throttle';
import User from '../models/user.model.js';
import onChange from 'on-change'
import { age } from './defaults.js';

export const users = {}; // Main user obj to look at

const maxClientTimeout = 10; // UDP client "timeout" in seconds

const udpClients = {};

// FIXME: Dumbass loop, Looks for ips that have not send data in a while and delete them
setInterval(() => {
  console.log(users);
  Object.keys(users).forEach((id) => {
    if (age(users[id]) > maxClientTimeout) { delete users[id]; }
  });
}, 3000);

export const lastSeen = (obj) => {
  const user = obj;
  user.lastSeen = Date.now();
};
export const addUDPuser = async (ip, userID) => {
  const findUser = await User.find({ mid: userID }).exec();
  let createUser;
  if (!(userID in users)) users[userID] = {};
  if (findUser.length === 0) {
    // create new user
    const newUser = new User({ mid: userID });
    createUser = await newUser.save();
  } else {
    const [a] = findUser;
    console.log(a);
    createUser = a;
    // add user id to users
  }
  users[userID].mongodb_mid = createUser.mid;
  users[userID].mongodb_id = createUser._id;
  users[userID].ip = ip;
  users[userID].firstSeen = Date.now();
};
export const addIOuser = async (socket, ip, userID) => {
  // Check if we have a udp user with id
  if (!(userID in users)) users[userID] = {};
  users[userID].socketID = socket.id;

  // This is basically everyone going on website
  // User only gets created if you push UDP data
  // Store IO user in array to match if we get udp data
  // ioUsers.push({"ioid": id, "ip": ip})

  // Check if we have UDP
  // const checkCache = await client.hGetAll(ip);
  // console.log(checkCache)
};

const watchedObject = onChange(udpClients, (path, value, previousValue) => {
  if (previousValue === undefined) {
    console.log(`${path} connected to UDP`);
    addUDPuser(path, value);
  }
  // if previousValue != undefined && value === unix then update
  // if (value != undefined)
  // defudpClients[path] = value
});

// Basically add user on first connect
export const makeUDPuser = throttle((ip, userID) => {
  watchedObject[ip] = userID;
}, 3000);
