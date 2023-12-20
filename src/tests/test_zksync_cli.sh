#!/bin/bash

declare -i counter_failed=0
declare -i counter_total=0
declare -i RESULT=0

verify_result () {
  RESULT=$?
  counter_total+=1
  if [ $RESULT -eq 0 ]; then
    echo ""
     echo "-----------> SUCCESS <-----------"
     echo "---------------------------------"
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

echo "Test #1717"
echo "---------------------------------"

echo "> npx zksync-cli -V"
npx zksync-cli -V
verify_result

echo "> npx zksync-cli --version"
npx zksync-cli --version
verify_result

###

echo "Test #1734"
echo "---------------------------------"

echo "> npx zksync-cli --help"
npx zksync-cli --help
verify_result

echo "---------------------------------"
echo "> npx zksync-cli --help deposit"
npx zksync-cli --help deposit
verify_result

###

echo "Test #1714"
echo "---------------------------------"

echo "> npx zksync-cli -h"
npx zksync-cli -h
verify_result

echo "---------------------------------"
echo "> npx zksync-cli --help"
npx zksync-cli -help
verify_result

###

echo "Test #1715"
echo "---------------------------------"

echo "npx zksync-cli dev -h"
npx zksync-cli dev -h
verify_result

echo "---------------------------------"
echo "npx zksync-cli dev --help"
npx zksync-cli dev --help
verify_result

echo "---------------------------------"
echo "npx zksync-cli dev --help start"
npx zksync-cli dev --help start
verify_result

###

echo "Test #1719"
echo "---------------------------------"

echo "> zksync-cli dev modules"
npx zksync-cli dev modules
verify_result

###

if [ $counter_failed == 0 ]; then
  echo "$counter_total tests Passed"
else
  echo "Fail. $counter_failed failed test(s)"
  exit 1 # terminate and indicate error
fi
