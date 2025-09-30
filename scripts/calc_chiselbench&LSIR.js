const fs = require('fs');
const path = require('path');

const workFiles = [
    "blade_issue_reduction",
    "chisel_issue_reduction",
    "cova_issue_reduction",
    "covf_issue_reduction",
    "cov_issue_reduction",
    "cov-eh_issue_reduction",
    "cov-exit-aug_issue_reduction",
    "cova-exit_issue_reduction",
    "covf-exit_issue_reduction",
    "cov-eh-exit_issue_reduction",
];

const workDir = path.join(path.resolve(__dirname, '..'), 'scripts_data/table2');
const outputFilePath = path.join(workDir, 'chiselbench&LSIR');

const chiselBench = [
    "bzip2-1.0.5",
    "chown-8.2",
    "date-8.21",
    "grep-2.19",
    "gzip-1.2.4",
    "mkdir-5.2.1",
    "rm-8.4",
    "sort-8.16",
    "tar-1.14",
    "uniq-8.16",
];

function allIssues(){
    let outputContent = '';

    for (let workFile of workFiles) {
        const fuzzResultPath = path.join(workDir, workFile+"_merge");
        const content = fs.readFileSync(fuzzResultPath, 'utf-8');
        const lines = content.split('\n');
        let chiselbenchCrashSum = 0, LSIRCrashSum = 0;
        let chiselBenchReductionSum = 0, LSIRReductionSum = 0;
        let chiselBenchNum = 0, LSIRNum = 0;
        for (let line of lines) {
            if (line.trim() === '') continue; // 跳过空行
            const [tmp, program_name, tep, crash, temp, reduction] = line.split(' ').filter(Boolean);
            if (chiselBench.includes(program_name)) {
                chiselbenchCrashSum += parseInt(crash);
                chiselBenchReductionSum += parseFloat(reduction);
                chiselBenchNum++;
            } else {
                LSIRCrashSum += parseInt(crash);
                LSIRReductionSum += parseFloat(reduction);
                LSIRNum++;
            }
        }
        const chiselbenchCrashAvg = chiselBenchNum > 0 ? (chiselbenchCrashSum / chiselBenchNum).toFixed(1) : "N/A";
        const LSIRCrashAvg = LSIRNum > 0 ? (LSIRCrashSum / LSIRNum).toFixed(1) : "N/A";
        const chiselbenchReductionAvg = chiselBenchNum > 0 ? (chiselBenchReductionSum / chiselBenchNum).toFixed(2) : "N/A";
        const LSIRReductionAvg = LSIRNum > 0 ? (LSIRReductionSum / LSIRNum).toFixed(2) : "N/A";

        outputContent += `${workFile}\n`;
        outputContent += `chiselbench reduction avg: ${chiselbenchReductionAvg}\n`;
        outputContent += `chiselbench crash avg: ${chiselbenchCrashAvg}\n`;
        outputContent += `LSIR reduction avg: ${LSIRReductionAvg}\n`;
        outputContent += `LSIR crash avg: ${LSIRCrashAvg}\n`;
        const tmp1 = ((parseFloat(chiselbenchReductionAvg) + parseFloat(LSIRReductionAvg)) / 2).toFixed(2);
        const tmp2 = ((parseFloat(chiselbenchCrashAvg) + parseFloat(LSIRCrashAvg)) / 2).toFixed(1);
        outputContent += `average reduction: ${tmp1}\n`;
        outputContent += `average crash: ${tmp2}\n\n`;
    }

    // 将结果写入文件
    fs.writeFileSync(outputFilePath, outputContent);

    console.log('结果已写入文件:', outputFilePath);
}

function relatedIssues(){
    let outputContent = '';

    for (let workFile of workFiles) {
        const fuzzResultPath = path.join(workDir, workFile);
        const content = fs.readFileSync(fuzzResultPath, 'utf-8');
        const lines = content.split('\n');
        let chiselbenchCrashSum = 0, LSIRCrashSum = 0;
        let chiselBenchNum = 0, LSIRNum = 0;
        for (let line of lines) {
            if (line.trim() === '') continue; // 跳过空行
            const [tmp, program_name_tmp, tep, crash_tmp, temp, reduction] = line.split(' ').filter(Boolean);
            if(! program_name_tmp.includes("input") ) continue;
            const program_name=program_name_tmp.split("-")[0]+"-"+program_name_tmp.split("-")[1];
            const crash=crash_tmp.replace(",","");
            if(program_name == "bash-2.05" || program_name == "vim-5.8") continue;
            if (chiselBench.includes(program_name)) {
                chiselbenchCrashSum += parseInt(crash);
                chiselBenchNum++;
            } else {
                LSIRCrashSum += parseInt(crash);
                LSIRNum++;
            }
        }
        const chiselbenchCrashAvg = chiselBenchNum > 0 ? (chiselbenchCrashSum / chiselBenchNum).toFixed(1) : "N/A";
        const LSIRCrashAvg = LSIRNum > 0 ? (LSIRCrashSum / LSIRNum).toFixed(1) : "N/A";
        outputContent += `${workFile}\n`;
        outputContent += `chiselbench Related-crash avg: ${chiselbenchCrashAvg}\n`;
        outputContent += `LSIR Related-crash avg: ${LSIRCrashAvg}\n`;
        const tmp1 = ((parseFloat(chiselbenchCrashAvg) + parseFloat(LSIRCrashAvg)) / 2).toFixed(1);
        outputContent += `average Related-crash: ${tmp1}\n\n`;

    }

    // 将结果写入文件
    fs.appendFileSync(outputFilePath, outputContent);

    console.log('结果已写入文件:', outputFilePath);
}

allIssues();
relatedIssues();