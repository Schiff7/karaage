# build karaage

files=`ls ../data`
prefix="{\n  \"values\": ["
suffix="\n  ]\n}"
result=${prefix}
for file in ${files}
do
  result="${result}\n    \"${file}\","
done
result="${result%,}${suffix}"
mkdir build
echo -e ${result} > build/posts.json