near delete animal-right.phmai.testnet phmai.testnet

near create-account animal-right.phmai.testnet --masterAccount phmai.testnet --initialBalance 10


near deploy \
    --wasmFile out/main.wasm \
    --initFunction "new" \
    --initArgs '{
        "owner": "animal-right.phmai.testnet"
    }' \
    --accountId animal-right.phmai.testnet