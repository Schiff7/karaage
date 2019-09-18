#!/bin/bash

# Build karaage

# List and read markdown files in the `/data/` directory,
# to every file, a json object as follow:
# { 
#   name: string;
#   date: { y: string; m: string; d: string; };
#   slug: string;
#   tags: string[];
#   category: string;
# }
# will be generated.
# All generated objects will be collected to an array,
# and the array will be written to the file `/api/build/content.json`.
#

# Path to the build file.
current_path=$(cd $(dirname $0); pwd)
# Path to project root.
root_path=${current_path%/*}
files=`ls ${root_path}/data`
demos=`ls ${root_path}/demos`
prefix="["
suffix="\n]"
# handle the files start
files_result=${prefix}
for file in ${files}
do
  # File's full name.
  full_name=${file}
  # Path to the current file.
  full_file_path="${root_path}/data/${file}"
  # Read the first line of the file, which contains the current file's infomation of tags and category.
  # e.g. [//]: # ("tags": [ "essay" ], "category": "Uncategorized")
  tags_and_category=`sed -n '1p' ${full_file_path}`
  tags_and_category=${tags_and_category#*(}
  tags_and_category=${tags_and_category%)}
  file=${file%\.*}
  file="{ \"name\": \"${full_name}\", \"date\": { \"y\": \"${file:0:4}\", \"m\": \"${file:5:2}\", \"d\": \"${file:8:2}\" }, \"slug\": \"${file:11}\", ${tags_and_category} }"
  files_result="${files_result}\n\t${file},"
done
files_result="${files_result%,}${suffix}"
# handle the demos start
demos_result=${prefix}
for demo in ${demos}
do
  demo="\"${demo}\""
  demos_result="${demos_result}\n\t${demo},"
done
demos_result="${demos_result%,}${suffix}"
# Where the output file should be.
build_path="${root_path}/api/build"
# Build the output directory if not exist.
if [ ! -d ${build_path} ]; then
  mkdir ${build_path}
fi
# Redirect the STDOUT to the target file.
echo -e ${files_result} > "${build_path}/content.json"
echo -e ${demos_result} > "${build_path}/demos.json"