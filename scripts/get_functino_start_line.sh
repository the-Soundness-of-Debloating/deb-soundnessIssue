#!/bin/sh

cd ..

deb_tools=("chisel" "cov" "covf" "cova" "blade" "cov-eh") 
for deb_tool in ${deb_tools[@]}
do  
    # 进入根目录的cov目录
    # 进入根目录的cov目录
    cd $deb_tool || { echo "无法进入cov目录"; exit 1; }
    # 遍历cov目录下的所有二级目录
    for dir in */; do
        # 定义crash_info文件的路径
        FUNCTION_LINE="function_lines"
        echo $dir
        cd $dir
        ctags -x --c-kinds=f *c.origin.c > function_lines

        cd ..
    done
    cd ..
done