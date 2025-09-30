#!/bin/sh
cd ..

#> scripts_data/table1/ave_issue_reduction
> scripts_data/table2/chisel_issue_reduction
> scripts_data/table2/cov_issue_reduction
> scripts_data/table2/covf_issue_reduction
> scripts_data/table2/cova_issue_reduction
> scripts_data/table2/blade_issue_reduction
> scripts_data/table2/cov-eh_issue_reduction
> scripts_data/table2/cov-exit-aug_issue_reduction
> scripts_data/table2/cova-exit_issue_reduction
> scripts_data/table2/covf-exit_issue_reduction
> scripts_data/table2/cov-eh-exit_issue_reduction


deb_tools=("chisel" "blade" "cov" "cova" "covf" "cov-eh" "cov-exit-aug" "cova-exit" "covf-exit" "cov-eh-exit") 
for deb_tool in "${deb_tools[@]}"; do  
    ave_reduction=0
    ave_issue=0

    cd "$deb_tool" || { echo "无法进入 $deb_tool 目录"; exit 1; }

    for dir in */; do
        cd "$dir" || { echo "无法进入 $dir 目录"; cd ..; continue; }
        
        if [ -f analysis ]; then
            issue_line=$(wc -l < analysis)
            ave_issue=$((ave_issue + issue_line))
        else
            issue_line=0
        fi
        
        reduced_line=$(sed -n '1p' deb_lines | awk '{print $4}')

        if ls *.reduced.c 1> /dev/null 2>&1; then
            origin_line=$(grep -v "^\s*$" *.origin.c | wc -l)
        else
            origin_line=0
        fi

        reduced_line=$((origin_line - reduced_line))

        if [ "$origin_line" -ne 0 ]; then
            reduction=$(echo "scale=4; $reduced_line / $origin_line" | bc)
            # if [[ ! $dir == *"input"* ]]; then
            #     ave_reduction=$(echo "scale=4; $ave_reduction + $reduction" | bc)  
            # fi 
        else
            reduction=0
            echo "origin_line is 0"
            echo "$deb_tool $dir"
        fi

        echo "$deb_tool $dir issue: $issue_line, reduction: $(echo "$reduction * 100" | bc)%" >> "../../scripts_data/table2/${deb_tool}_issue_reduction"
        cd ..
    done

    cd ..
done