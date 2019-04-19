# build karaage

files=`ls data`
prefix="{\n\t\"values\": ["
suffix="\n\t]\n}"
result=${prefix}
for file in ${files}
do
  result="${result}\n\t\t\"${file}\","
done
result="${result%,}${suffix}"
mkdir api
echo -e ${result} > api/posts.json