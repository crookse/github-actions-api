# GitHub Actions Service

## Quick Start

```yaml
# File: ./.github/workflows/main.yml

name: main

on:
  push:
    branches:
      - main

jobs:
  socials:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        deno: ["1.5.2"]
    steps:
      - uses: actions/checkout@v2

      - name: Install Deno v${{ matrix.deno }}
        uses: denolib/setup-deno@master
        with:
          deno-version: ${{ matrix.deno }}

      - name: Post to Reddit
        run: deno run --allow-net ./reddit.ts \
          ${{ secrets.REDDIT_USERNAME }} \
          ${{ secrets.REDDIT_PASSWORD }} \
          ${{ secrets.REDDIT_APP_ID }} \
          ${{ secrets.REDDIT_APP_SECRET }} \
          "deno-drash"

      - name: Post to Twitter
        run: deno run --allow-net ./twitter.ts \
          ${{ secrets.TWITTER_CONSUMER_API_KEY }} \
          ${{ secrets.TWITTER_CONSUMER_API_SECRET }} \
          ${{ secrets.TWITTER_ACCESS_TOKEN }} \
          ${{ secrets.TWITTER_ACCESS_TOKEN_SECRET }} \
          "deno-drash"
```
