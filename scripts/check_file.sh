#!/bin/sh

# 定义工具数组
deb_tools=("chisel" "cov" "covf" "cova" "blade")

# 定义输出文件
missing_analysis_file="missing_analysis.txt"
missing_crash_info_file="missing_crash_info.txt"
missing_deb_lines_file="missing_deb_lines.txt"

# 清空之前的输出文件，避免内容叠加
> $missing_analysis_file
> $missing_crash_info_file
> $missing_deb_lines_file

cd ..

# 遍历工具和二级目录
for deb_tool in ${deb_tools[@]}
do  
    cd $deb_tool
    for dir in */;
    do
        if [ ! -f "${dir}analysis" ] ; then
            echo "缺少analysis的目录: $deb_tool/$dir" >> "../scripts/$missing_analysis_file"
        fi
        if [ ! -f "${dir}crash_info" ] ; then
            echo "缺少crash_info的目录: $deb_tool/$dir" >> "../scripts/$missing_crash_info_file"
        fi
        if [ ! -f "${dir}deb_lines" ]; then
            echo "缺少deb_lines的目录: $deb_tool/$dir" >> "../scripts/$missing_deb_lines_file"
        fi
    done
    cd ..
done

echo "结果已分别输出到 $missing_analysis_file, $missing_crash_info_file, $missing_deb_lines_file"
