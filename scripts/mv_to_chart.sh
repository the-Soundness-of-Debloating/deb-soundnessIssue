#!/bin/sh

arg=$1

# 定义目标目录

cd ..

pwd=$(pwd)
TARGET_DIR="$pwd/../deb-vul-distribution-chart/$arg"

deb_tools=("chisel" "cov" "covf" "cova" "blade" "cov-eh") 
for deb_tool in ${deb_tools[@]}
do  
    # 进入根目录的cov目录
    cd $deb_tool || { echo "无法进入cov目录"; exit 1; }
    tool_name=$deb_tool
    if [ $deb_tool = "cov-eh" ]; then
        tool_name="coveh"
    fi
    mkdir -p $TARGET_DIR/$tool_name
    rm -rf $TARGET_DIR/$tool_name/*
    # 遍历cov目录下的所有二级目录
    for dir in */; do
        # 定义crash_info文件的路径
        CRASH_INFO_FILE="$arg"
        echo $dir
        cd $dir
        # 检查crash_info文件是否存在
        if [ -f "$CRASH_INFO_FILE" ]; then
            # 根据目录结构重命名文件，使用路径中的/替换为_
            NEW_NAME=$(echo "$dir" | tr '/' '_')$arg
            cp "$CRASH_INFO_FILE" "$TARGET_DIR/$tool_name/$NEW_NAME"
            echo "已复制: $CRASH_INFO_FILE -> $TARGET_DIR/$NEW_NAME"
        else
            echo "文件不存在: $CRASH_INFO_FILE"
        fi
        cd ..
    done
    cd ..
done