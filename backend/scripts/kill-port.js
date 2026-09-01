#!/usr/bin/env node
/**
 * kill-port.js
 * Pre-start cleanup script that:
 *   1. Kills ALL orphaned nodemon instances for this project
 *   2. Kills any process listening on PORT
 *
 * This permanently prevents EADDRINUSE on Windows where signal-based
 * graceful shutdown is unreliable.
 */

'use strict';

const { execSync } = require('child_process');
const path = require('path');
const PORT = process.env.PORT || 5000;

// Project root — used to match only THIS project's node processes
const PROJECT_ROOT = path.resolve(__dirname, '..').replace(/\\/g, '\\\\');

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
}

function killPid(pid) {
  if (!pid || pid <= 0 || pid === process.pid) return false;
  try {
    execSync(`taskkill /PID ${pid} /F`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getOrphanedServerPids() {
  // Find all node.exe processes running server.js for this project,
  // plus all nodemon.js processes for this project
  const pids = new Set();
  try {
    const raw = execSync(
      `wmic process where "name='node.exe'" get ProcessId,CommandLine /format:csv`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    raw.split('\n').forEach(line => {
      line = line.trim();
      if (!line) return;
      // CSV: Node,CommandLine,ProcessId
      const parts = line.split(',');
      if (parts.length < 3) return;
      const cmdLine = parts.slice(1, parts.length - 1).join(',');
      const pid = parseInt(parts[parts.length - 1], 10);
      if (!pid || pid <= 0) return;
      // Match processes that reference our project folder AND server.js or nodemon
      if (
        (cmdLine.includes('server.js') || cmdLine.includes('nodemon')) &&
        cmdLine.toLowerCase().includes('project\\backend')
      ) {
        pids.add(pid);
      }
    });
  } catch {
    // wmic not available, fall back to nothing (port-based kill still runs)
  }
  return Array.from(pids);
}

function getListeningPids(port) {
  const pids = new Set();
  try {
    const raw = execSync(
      `netstat -ano -p TCP`,
      { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
    );
    raw.trim().split('\n').forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 5) {
        const localAddr = parts[1];
        const state = parts[3];
        const pid = parseInt(parts[4], 10);
        if (localAddr.endsWith(`:${port}`) && state === 'LISTENING' && pid > 0) {
          pids.add(pid);
        }
      }
    });
  } catch {
    // ignore
  }
  return Array.from(pids);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  let killed = 0;

  // Step 1: Kill orphaned server/nodemon instances for this project
  const orphans = getOrphanedServerPids().filter(p => p !== process.pid);
  if (orphans.length > 0) {
    console.log(`[pre-dev] Found ${orphans.length} orphaned backend process(es): [${orphans.join(', ')}]. Killing...`);
    for (const pid of orphans) {
      const ok = killPid(pid);
      if (ok) killed++;
      console.log(`[pre-dev]   PID ${pid}: ${ok ? 'killed' : 'already gone'}`);
    }
    // Give OS time to release port after kills
    await sleep(600);
  }

  // Step 2: Kill anything STILL listening on PORT (belt-and-suspenders)
  const listeners = getListeningPids(PORT).filter(p => p !== process.pid && p > 0);
  if (listeners.length > 0) {
    console.log(`[pre-dev] Process(es) still on port ${PORT}: [${listeners.join(', ')}]. Killing...`);
    for (const pid of listeners) {
      const ok = killPid(pid);
      if (ok) killed++;
      console.log(`[pre-dev]   PID ${pid}: ${ok ? 'killed' : 'already gone'}`);
    }
    await sleep(400);
  }

  if (killed === 0 && orphans.length === 0 && listeners.length === 0) {
    console.log(`[pre-dev] Port ${PORT} is free. No orphaned processes found.`);
  } else {
    // Verify port is now free
    const remaining = getListeningPids(PORT);
    if (remaining.length > 0) {
      console.warn(`[pre-dev] WARNING: port ${PORT} still occupied by PIDs [${remaining.join(', ')}].`);
    } else {
      console.log(`[pre-dev] Port ${PORT} is now free.`);
    }
  }
}

main().catch(err => {
  console.error('[pre-dev] Error:', err.message);
  // Do not block server start
});
