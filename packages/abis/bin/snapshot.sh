#!/bin/bash

# check arg
if [ $# -eq 0 ]; then
    echo "Error: Please provide a contract ABI path as argument"
    exit 1
fi

filename=$1
base=$(basename "$filename" .json)


# find latest version number
latest=0
for f in src/versions/$base/$base.*.json; do
  if [ -f "$f" ]; then
    ver=$(echo "$f" | grep -o '[0-9]*\.json' | grep -o '[0-9]*')
    
    if [ "$ver" -ge "$latest" ]; then
      latest=$((ver + 1))
    fi
  fi
done

# new filename with version number
new_filename="$base.$latest.json"
new_folder="src/versions/$base"
mkdir -p $new_folder
cp -r $filename $new_folder/$new_filename
echo "File $filename archived under $new_folder$new_filename"
