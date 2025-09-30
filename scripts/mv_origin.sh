#!/bin/sh

# 定义目标目录

cd ..

pwd=$(pwd)
TARGET_DIR="$pwd/../deb-vul-distribution-chart/origin"

rm -rf $TARGET_DIR/*

deb_tools=("cov" "cova" "covf" "blade" "chisel" "cov-eh") 
for deb_tool in ${deb_tools[@]}
do  
    cd $deb_tool || { echo "无法进入 $deb_tool 目录"; exit 1; }
    echo $(pwd)
    tool_name=$deb_tool
    if [ $deb_tool = "cov-eh" ]; then
        tool_name="coveh"
    fi
    mkdir -p $TARGET_DIR/$tool_name
    for dir in */; do
        echo $dir
        cd $dir
        origin_files=$(find . -maxdepth 1 -name "*.origin.c")

        dir_name=$(basename $dir)
        IFS='-' read -r part1 part2 part3 part4<<< "$dir_name"
        NEW_NAME=""
        if [ "$part1" = "space" ]; then
            NEW_NAME="${part1}_${part2}"
        elif [ "$part1" = "grep" ] && [ "$part2" = "2.4.2" ]; then
            NEW_NAME="${part1}2_${part3}"
        elif [ "$part1" = "gzip" ] && [ "$part2" = "1.3" ]; then
            NEW_NAME="${part1}2_${part3}"
        elif [ -n "$part1" ] && [ -n "$part3" ]; then
            NEW_NAME="${part1}_${part3}"
        fi
        if [ -n "$origin_files" ]; then
            for origin in $origin_files; do
                cp "$origin" "$TARGET_DIR/$tool_name/$NEW_NAME"
                echo "copy: $origin -> $TARGET_DIR/$tool_name/$NEW_NAME"
            done
        else
            echo "file not exist: *.origin.c"
        fi
        cd ..
    done
    cd ..
done