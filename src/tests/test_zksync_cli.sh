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
     echo " "
  else
    echo ""
    echo "-----------> FAILED <-----------"
    echo " "
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
npx zksync-cli --help
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

echo "Test #1869"
echo "---------------------------------"

echo "> zksync-cli wallet balance on Sepolia Testnet"
npx zksync-cli wallet balance --chain zksync-sepolia --address 0x52B6d10d7d865B3d4103f8809AA3521288568f46

echo "> zksync-cli wallet balance on Zksync Mainnet"
npx zksync-cli wallet balance --chain zksync-mainnet --address 0x52B6d10d7d865B3d4103f8809AA3521288568f46

echo "> zksync-cli wallet balance on Goerli Testnet"
npx zksync-cli wallet balance --chain zksync-goerli --address 0x52B6d10d7d865B3d4103f8809AA3521288568f46


verify_result

###

echo "Test #1718"
echo "---------------------------------"

echo "> zksync-cli dev update <module>"
npx zksync-cli dev update zkcli-portal

verify_result

###

echo "Test #1874"
echo "---------------------------------"

echo "> zksync-cli contract read"
npx zksync-cli contract read --chain zksync-sepolia --contract 0xE6c391927f0B42d82229fd3CFe3426F209D16b48 --method "greet() view returns (string)" --output string

verify_result

###

echo "Test #1875"
echo "---------------------------------"

echo "> zksync-cli contract write"
npx zksync-cli contract write --chain zksync-sepolia --contract 0xE6c391927f0B42d82229fd3CFe3426F209D16b48 --method "setGreeting(string _greeting) " --args "New Test ARG" --private-key 32e2e997e1a2d91cee03f77f903103ce6f50301e125307cc4bcaa87313f1a13e

verify_result

###


if [ $counter_failed == 0 ]; then
  echo "$counter_total tests Passed"
else
  echo "Fail. $counter_failed failed test(s)"
  exit 1 # terminate and indicate error
fi
