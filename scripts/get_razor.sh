cd ..

source_dir=../fuzzing-deb-with-sanitizers/razor
target_dir=razor

for fuzz_dir in $source_dir/*
do
    fuzz_dir_name=$(basename $fuzz_dir)
    cp $fuzz_dir/verify_result $target_dir/$fuzz_dir_name.result
done