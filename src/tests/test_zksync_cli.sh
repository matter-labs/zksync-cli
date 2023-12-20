#!/bin/bash

declare -i counter_failed=0
declare -i counter_total=0
declare -i RESULT=0

verify_result () {
  RESULT=$?
  counter_total+=1
  if [ $RESULT -eq 0 ]; then
    echo ""
    # echo "-----------> SUCCESS <-----------"
    # echo "---------------------------------"
  else
    echo ""
    echo "-----------> FAILED <-----------"
    echo "---------------------------------"
    counter_failed+=1
  fi
} 

echo "INFO"

echo "node:"
node --version
echo "npm:"
npm --version
echo "docker:"
docker --version

#BASIC
echo ""
echo "Test #1717 > zksync-cli -V"

npx zksync-cli -V
verify_result
npx zksync-cli --version
verify_result

###

echo ""
echo "Test #1734 > zksync-cli -h"

npx zksync-cli help
verify_result
npx zksync-cli help deposit
verify_result

###

echo ""
echo "Test #1714 > zksync-cli -h"

npx zksync-cli -h
verify_result
npx zksync-cli -help
verify_result

###

echo ""
echo "Test #1715 > zksync-cli -h"

npx zksync-cli dev -h
verify_result
npx zksync-cli dev -help
verify_result
npx zksync-cli dev help start
verify_result

###

echo ""
echo "Test #1719 > zksync-cli dev modules"

npx zksync-cli dev modules
verify_result

###

if [ $counter_failed == 0 ]; then
  echo "$counter_total tests Passed"
else
  echo "Fail. $counter_failed failed test(s)"
  exit 1 # terminate and indicate error
fi
