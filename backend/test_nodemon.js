const { spawn } = require('child_process');

const nodemon = spawn('npx.cmd', ['nodemon', '--verbose', 'server.js'], { cwd: __dirname, shell: true });

nodemon.stdout.on('data', (data) => {
    const text = data.toString();
    console.log(`STDOUT: ${text}`);
    if (text.includes('restarting due to changes')) {
        console.log("Saw restart! Killing nodemon...");
        nodemon.kill();
        process.exit(0);
    }
});

nodemon.stderr.on('data', (data) => {
    console.error(`STDERR: ${data.toString()}`);
});

setTimeout(() => {
    console.log("Timeout reached. Killing nodemon.");
    nodemon.kill();
    process.exit(0);
}, 30000);
