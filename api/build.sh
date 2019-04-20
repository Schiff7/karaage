#!/bin/bash
# build karaage

files=`ls ../data`
prefix="{\n\t\"values\": ["
suffix="\n\t]\n}"
result=${prefix}
for file in ${files}
do
  file="${file%\.*}"
  file="{ date: { y: ${file:0:4}, m: ${file:5:2}, d: ${file:8:2} }, slug: ${file:11} }"
  result="${result}\n\t\t\"${file}\","
done
result="${result%,}${suffix}"
if [ ! -d "./build/" ]; then
  mkdir build
fi
echo -e ${result} > build/posts.json