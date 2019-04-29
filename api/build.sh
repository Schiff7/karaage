#!/bin/bash
# build karaage

current_path=$(cd $(dirname $0); pwd)
root_path=${current_path%/*}
files=`ls ${root_path}/data`
prefix="["
suffix="\n]"
result=${prefix}
for file in ${files}
do
  full_name=${file}
  full_file_path="${root_path}/data/${file}"
  tags_and_category=`sed -n '1p' ${full_file_path}`
  tags_and_category=${tags_and_category#*(}
  tags_and_category=${tags_and_category%)}
  file=${file%\.*}
  file="{ \"name\": \"${full_name}\", \"date\": { \"y\": \"${file:0:4}\", \"m\": \"${file:5:2}\", \"d\": \"${file:8:2}\" }, \"slug\": \"${file:11}\", ${tags_and_category} }"
  result="${result}\n\t${file},"
done
result="${result%,}${suffix}"
build_path="${root_path}/api/build"
if [ ! -d ${build_path} ]; then
  mkdir ${build_path}
fi
echo -e ${result} > "${build_path}/content.json"