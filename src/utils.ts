import fs from 'fs/promises';
import { ZKSYNC_DIR } from './constants';

// check if .zysync exists in ~ and create it if not
const checkAndCreateZkSyncDir = async () => {
    const zksyncDir = getZKSYNCDir();
    try {
      await fs.access(zksyncDir);
    } catch (e) {
      await fs.mkdir(zksyncDir);
    }
  };

const getZKSYNCDir = () => {
    const homeDir = process.env.HOME || process.env.USERPROFILE;
    return `${homeDir}/${ZKSYNC_DIR}`;
}

export {
  checkAndCreateZkSyncDir,
  getZKSYNCDir,
}