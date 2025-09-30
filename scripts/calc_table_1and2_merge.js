const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const baseDir = path.resolve(__dirname, '..');

// 清空文件
const clearFiles = [
    'scripts_data/table1/ave_issue_reduction',
    'scripts_data/table2/chisel_issue_reduction_merge',
    'scripts_data/table2/cov_issue_reduction_merge',
    'scripts_data/table2/covf_issue_reduction_merge',
    'scripts_data/table2/cova_issue_reduction_merge',
    'scripts_data/table2/blade_issue_reduction_merge',
    'scripts_data/table2/cov-eh_issue_reduction_merge',
    'scripts_data/table2/cov-exit-aug_issue_reduction_merge',
    'scripts_data/table2/cova-exit_issue_reduction_merge',
    'scripts_data/table2/covf-exit_issue_reduction_merge',
    'scripts_data/table2/cov-eh-exit_issue_reduction_merge',
    'scripts_data/table2/table2_latex',
    'scripts_data/table2/table2'
];

clearFiles.forEach(file => {
    fs.writeFileSync(path.join(baseDir, file), '');
});

const debTools = ["chisel", "blade", "cov", "cova", "covf","cov-eh","cov-exit-aug","cova-exit","covf-exit","cov-eh-exit"];
const programLength = {};
const debToolsMap = {}

debTools.forEach(debTool => {
    let aveReduction = 0;
    let aveIssue = 0;
    let aveIssueRelated = 0;
    const debToolDir = path.join(baseDir, debTool);
    if (!fs.existsSync(debToolDir)) {
        console.error(`无法进入 ${debTool} 目录`);
        process.exit(1);
    }

    const subDirs = fs.readdirSync(debToolDir).filter(file => fs.statSync(path.join(debToolDir, file)).isDirectory());
    var lastNum=0;
    var lastName="";
    var nameNum=0;
    const programNameMap = {};
    subDirs.forEach(dir => {
        const dirPath = path.join(debToolDir, dir);
        if (!fs.existsSync(dirPath)) {
            console.error(`无法进入 ${dir} 目录`);
            return;
        }
        var programName = dir.split('-')[0];
        if(dir.split('-')[1].includes('.')){
            programName = programName + "-" + dir.split('-')[1];
        }
        const analysisPath = path.join(dirPath, 'analysis');
        let issueLine = 0;
        if (fs.existsSync(analysisPath)) {
            issueLine = parseInt(execSync(`wc -l < ${analysisPath}`).toString().trim(), 10);
            aveIssue += issueLine;
            if(dir.toString().includes("input")){
                aveIssueRelated += issueLine;
            }
        }

        const debLinesPath = path.join(dirPath, 'deb_lines');
        if (!fs.existsSync(debLinesPath)) {
            console.log(`No deb_lines file in ${dirPath}`);
            return;
        }
        const reducedLine = parseInt(execSync(`sed -n '1p' ${debLinesPath} | awk '{print $4}'`).toString().trim(), 10);

        // Check if *.reduced.c files exist
        const originCFiles = execSync(`ls ${path.join(dirPath, '*.origin.c')} 2>/dev/null || echo ""`).toString().trim();
        if (!originCFiles) {
            console.log(`No *.origin.c files in ${dirPath}`);
            return;
        }
        const originLine = parseInt(execSync(`grep -v "^\s*$" ${path.join(dirPath, '*.origin.c')} | wc -l`).toString().trim(), 10);
        //console.log(`${dir} origin_line: ${originLine}`);
        const reductionLine = originLine - reducedLine;
        let reduction = 0;
        
        if (originLine !== 0) {
            reduction = parseFloat((reductionLine / originLine).toFixed(4));
            if (programName != lastName){ 
                nameNum+=1;
                programLength[programName] = originLine;
                aveReduction += reduction;
                programNameMap[programName] = [reduction, issueLine];
            }
            else{
                programNameMap[programName][1] += issueLine;
            }
        } else {
            console.log("origin_line is 0");
            console.log(`${debTool} ${dir}`);
        }
        lastNum=issueLine;
        lastName=programName;
    });

    const programCount = nameNum;
    console.log(`${debTool} program count: ${programCount}`);
    aveIssue = (aveIssue / programCount).toFixed(4);
    aveReduction = ((aveReduction / programCount) * 100).toFixed(4);
    aveIssueRelated = (aveIssueRelated / (programCount-3)).toFixed(4); // execpt rm,mkdir,chown
    fs.appendFileSync(path.join(baseDir, 'scripts_data/table1/ave_issue_reduction'), `tool: ${debTool} ave_reduction: ${aveReduction}% ,ave_issue: ${aveIssue} , ave_issue_related: ${aveIssueRelated} \n`);

    for (const programName in programNameMap) {
        const [reduction, issueLine] = programNameMap[programName];
        const reductionPercentage = (reduction * 100).toFixed(2);
        fs.appendFileSync(path.join(baseDir, `scripts_data/table2/${debTool}_issue_reduction_merge`), `${debTool} ${programName.padEnd(20)} issue: ${issueLine.toString().padEnd(5)} reduction: ${reductionPercentage}%\n`);
    }

    debToolsMap[debTool] = programNameMap;
});

const programList = Object.keys(debToolsMap["cov"]);

// 添加表头到输出文件
fs.appendFileSync(
    path.join(baseDir, 'scripts_data/table2/table2_latex'),
    `Program Name      & LOC       & Blade & Chisel & Cov & Cova & Covf & Cov-eh & Average Reduction \\\\\n`
);
fs.appendFileSync(
    path.join(baseDir, 'scripts_data/table2/table2_latex'),
    `~                & (K)       & ~     & ~      & ~   & ~    & ~    & ~      & ~                 \\\\\n`
);
fs.appendFileSync(
    path.join(baseDir, 'scripts_data/table2/table2_latex'),
    `\\hline\n`
);

// 遍历程序列表并写入内容

const debToolsDisplay=["chisel", "blade", "cov", "cova", "covf","cov-eh"];

for (const programName of programList) {
    var contentIssue = "";
    var contentReduction = "";
    var aveIssue = 0;
    var aveIssueCount = 0;
    var aveReduction = 0;
    var aveReductionCount = 0;
    for (const debTool of debToolsDisplay) {
        const tmpMap = debToolsMap[debTool];
        if (!tmpMap[programName]) {
            contentReduction += "& NA ";
            contentIssue += "& NA ";
        } else {
            const [reduction, issueLine] = tmpMap[programName];
            contentIssue += `& ${issueLine} `;
            contentReduction += `& ${(reduction * 100).toFixed(2)}\\% `;
            aveIssue += issueLine;
            aveIssueCount += 1;
            aveReduction += reduction;
            aveReductionCount += 1;
        }
    }
    contentIssue += "& " + (aveIssue / aveIssueCount).toFixed(1);
    contentReduction += "& " + (aveReduction / aveReductionCount * 100).toFixed(2) + "\\% \\\\";
    contentIssue += "\\\\ \\cline{2-12}";
    fs.appendFileSync(
        path.join(baseDir, 'scripts_data/table2/table2_latex'),
        `${programName.padEnd(15)} ${((programLength[programName] / 1000).toFixed(1) + "K").padEnd(10)} ${contentReduction.trim()}\n`
    );
    fs.appendFileSync(
        path.join(baseDir, 'scripts_data/table2/table2_latex'),
        `${" ".repeat(25)} ~  & ~ & ~ & ~ &\\#Issues  ${contentIssue.trim()}\n`
    );
}