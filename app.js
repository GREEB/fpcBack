/* eslint-disable no-unused-vars */
/* eslint no-process-env:0 */

import getInitInfo from './modules/mongo.js';
import udpServer from './modules/udpServer.js'; // Create UDP Server
import { io } from './modules/expresssocket.js'; // Create Express and Socket server

// Get initial Info
getInitInfo();

