HASH=$(ipfs add -r out -Q)
ipfs name publish --key=xswr-docs /ipfs/$HASH
sleep 10
curl -s https://xswr.hazae41.eth.limo > /dev/null