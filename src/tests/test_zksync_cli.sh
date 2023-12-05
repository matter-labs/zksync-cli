#!/bin/bash

declare -i counter_failed=0
declare -i counter_total=0
declare -i RESULT=0

verify_result () {
  counter_total+=1
  if [ $RESULT -eq 0 ]; then
    echo "\n\n"
    echo "-----------> SUCCESS <-----------"
    echo "---------------------------------"
  else
    echo "\n\n"
    echo "-----------> FAILED <-----------"
    echo "---------------------------------"
    counter_failed+=1
  fi
} 

echo "INFO"

node --version
npm --version
docker --version

#BASIC
echo "1. BASIC"
echo "-----------> Basic command like zksync-cli --help"

$(npx zksync-cli --help)
RESULT=$?
verify_result


echo ""
echo "-----------> zksync-cli -V"

$(npx zksync-cli -V)
RESULT=$?
verify_result

echo ""
echo "-----------> zksync-cli -h"

$(npx zksync-cli -h)
RESULT=$?
verify_result


#DEV PART
echo ""
echo "2. DEV PART"
echo "-----------> zksync-cli dev --help"

$(npx zksync-cli dev --help)
RESULT=$?
verify_result


echo ""
echo "-----------> zksync-cli dev config"

$(yes | npx zksync-cli dev config)
RESULT=$?
verify_result


#############

echo ""
echo "-----------> zksync-cli dev start"

$(npx zksync-cli dev start)
RESULT=$?
verify_result

echo ""
echo "-----------> zksync-cli dev stop"

$(npx zksync-cli dev stop)
RESULT=$?
verify_result

echo ""
echo "-----------> zksync-cli dev restart"

$(npx zksync-cli dev restart)
RESULT=$?
verify_result

##########

echo ""
echo "-----------> zksync-cli dev logs"

$(npx zksync-cli dev logs)
RESULT=$?
verify_result

echo ""
echo "-----------> zksync-cli dev clean"

$(npx zksync-cli dev clean)
RESULT=$?
verify_result

#echo ""
#echo "-----------> zksync-cli dev install zksync-web3@0.15.0"

#npx zksync-cli dev install zksync-web3@0.15.0
#verify_result

##########


#echo ""
#echo "-----------> zksync-cli dev update zksync-web3"

#npx zksync-cli dev update zksync-web3
#verify_result

#echo ""
#echo "-----------> zksync-cli dev uninstall zksync-web3"

#npx zksync-cli dev uninstall zksync-web3
#verify_result

echo ""
echo "-----------> zksync-cli dev modules"

$(npx zksync-cli dev modules)
RESULT=$?
verify_result
##########

#echo ""
#echo "-----------> zksync-cli create"
#yes | npx zksync-cli create
#verify_result

if [ $counter_failed == 0 ]; then
  echo "$counter_total tests Passed"
else
  echo "Fail. $counter_failed failed test(s)"
  exit 1 # terminate and indicate error
fi
