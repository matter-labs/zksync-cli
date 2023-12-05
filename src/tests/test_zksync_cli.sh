#!/bin/bash

declare -i RESULT_COMMON=0

verify_result () {
  RESULT_COMMON+=$?
  RESULT=$?
  if [ $RESULT -eq 0 ]; then
    echo success
  else
    echo failed
  fi
} 


#BASIC
echo "----- BASIC -----"
echo ">>> Basic command like zksync-cli"

npx zksync-cli
verify_result


echo ""
echo ">>> zksync-cli -V"

npx zksync-cli -V
verify_result

echo ""
echo ">>> zksync-cli -h"

npx zksync-cli -h
verify_result


#DEV PART
echo ""
echo "----- DEV PART -----"
echo ">>> zksync-cli dev"

npx zksync-cli dev
verify_result


echo ""
echo ">>> zksync-cli dev config"

yes | npx zksync-cli dev config
verify_result


#############

echo ""
echo ">>> zksync-cli dev start"

npx zksync-cli dev start
verify_result

echo ""
echo ">>> zksync-cli dev stop"

npx zksync-cli dev stop
verify_result

echo ""
echo ">>> zksync-cli dev restart"

npx zksync-cli dev restart
verify_result

##########

echo ""
echo ">>> zksync-cli dev logs"

npx zksync-cli dev logs
verify_result

echo ""
echo ">>> zksync-cli dev clean"

npx zksync-cli dev clean
verify_result

echo ""
echo ">>> zksync-cli dev install zksync-web3@0.15.0"

npx zksync-cli dev install zksync-web3@0.15.0
verify_result

##########


echo ""
echo ">>> zksync-cli dev update zksync-web3"

npx zksync-cli dev update zksync-web3
verify_result

echo ""
echo ">>> zksync-cli dev uninstall zksync-web3"

npx zksync-cli dev uninstall zksync-web3
verify_result

echo ""
echo ">>> zksync-cli dev modules"

npx zksync-cli dev modules
verify_result
##########

echo ""
echo ">>> zksync-cli create"
yes | npx zksync-cli create
verify_result

if [ $RESULT_COMMON -eq 0 ]; then
  echo success
else
  echo ERROR: RESULT_COMMON = $RESULT_COMMON
  exit 1 # terminate and indicate error
fi

