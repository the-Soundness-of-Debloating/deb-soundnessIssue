const fs = require('fs');
const path = require('path');

const baseDir = path.resolve(__dirname, '..');
const workDir = path.join(baseDir, 'razor');
const outDir = path.join(baseDir, 'scripts_data/razor');

const fuzzResultFiles = fs.readdirSync(workDir).filter(file => fs.statSync(path.join(workDir, file)).isFile());

let razorFuzzResult = {};

// 读取文件并填充razorFuzzResult
for (let fuzzResultFile of fuzzResultFiles) {
    const fuzzResultPath = path.join(workDir, fuzzResultFile);
    razorFuzzResult[fuzzResultFile] = {};
    const content = fs.readFileSync(fuzzResultPath, 'utf-8');
    const lines = content.split('\n');
    for (let line of lines) {
        const [level, num] = line.split(' ');
        const levelName = level.slice(0, -1);
        const [fz, fm] = String(num).split('/');
        razorFuzzResult[fuzzResultFile][levelName] = [parseInt(fz), parseInt(fm)];
    }
}

const levelNames = ["heuristic_4", "heuristic_3", "heuristic_2", "heuristic_1", "without-heuristic"];
let levelAve = {};
let fuzzFileAve = {};

let levelAvgUtil = {};
let lengthUtil = 0;
let levelAvgLSIR = {};
let lengthLSIR = 0;

// 初始化levelAve和fuzzFileAve
for (let levelName of levelNames) {
    levelAve[levelName] = 0;
    levelAvgUtil[levelName] = 0;
    levelAvgLSIR[levelName] = 0;
}
for (let fuzzResultFile of fuzzResultFiles) {
    fuzzFileAve[fuzzResultFile] = 0;
    // LSIR: sed|space|flex|gzip-1.3|grep-2.4.2|bash|make|vim
    if (fuzzResultFile.includes('sed') || fuzzResultFile.includes('space') || fuzzResultFile.includes('flex') ||
        fuzzResultFile.includes('gzip-1.3') || fuzzResultFile.includes('grep-2.4.2') || fuzzResultFile.includes('bash') ||
        fuzzResultFile.includes('make') || fuzzResultFile.includes('vim')) {
        lengthLSIR++;
    } else {
        lengthUtil++;
    }
}

// 计算纵向和横向的和
for (let fuzzResultFile of fuzzResultFiles) {
    for (let levelName of levelNames) {
        const [fz, fm] = razorFuzzResult[fuzzResultFile][levelName];
        const ratio = fz / fm;
        levelAve[levelName] += ratio;
        fuzzFileAve[fuzzResultFile] += ratio;

        if (fuzzResultFile.includes('sed') || fuzzResultFile.includes('space') || fuzzResultFile.includes('flex') ||
            fuzzResultFile.includes('gzip-1.3') || fuzzResultFile.includes('grep-2.4.2') || fuzzResultFile.includes('bash') ||
            fuzzResultFile.includes('make') || fuzzResultFile.includes('vim')) {
            levelAvgLSIR[levelName] += ratio;
        } else {
            levelAvgUtil[levelName] += ratio;
        }
    }
}

// 计算纵向和横向的平均值
for (let levelName of levelNames) {
    levelAve[levelName] = levelAve[levelName] / fuzzResultFiles.length;
    levelAvgUtil[levelName] = levelAvgUtil[levelName] / lengthUtil;
    levelAvgLSIR[levelName] = levelAvgLSIR[levelName] / lengthLSIR;
}
for (let fuzzResultFile of fuzzResultFiles) {
    fuzzFileAve[fuzzResultFile] = fuzzFileAve[fuzzResultFile] / levelNames.length;
}

fs.writeFileSync(path.join(outDir, 'razor_fuzz_result'), '');
// 输出结果到文件
fs.appendFileSync(path.join(outDir, 'razor_fuzz_result'), 'level'.padEnd(20) + 'crash ratio\n');
for (let levelName of levelNames) {
    fs.appendFileSync(path.join(outDir, 'razor_fuzz_result'), `${levelName.padEnd(20)}${levelAve[levelName].toFixed(4)}\n`);
}
fs.appendFileSync(path.join(outDir, 'razor_fuzz_result'), '\nChiselBench:\n');
for (let levelName of levelNames) {
    fs.appendFileSync(path.join(outDir, 'razor_fuzz_result'), `${levelName.padEnd(20)}${levelAvgUtil[levelName].toFixed(4)}\n`);
}
fs.appendFileSync(path.join(outDir, 'razor_fuzz_result'), '\nLSIR:\n');
for (let levelName of levelNames) {
    fs.appendFileSync(path.join(outDir, 'razor_fuzz_result'), `${levelName.padEnd(20)}${levelAvgLSIR[levelName].toFixed(4)}\n`);
}

fs.appendFileSync(path.join(outDir, 'razor_fuzz_result'), '\n' + 'fuzzFile'.padEnd(30) + 'crash ratio\n');
for (let fuzzResultFile of fuzzResultFiles) {
    fs.appendFileSync(path.join(outDir, 'razor_fuzz_result'), `${fuzzResultFile.padEnd(30)}${fuzzFileAve[fuzzResultFile].toFixed(4)}\n`);
}