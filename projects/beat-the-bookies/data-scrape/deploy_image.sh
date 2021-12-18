#!/bin/bash

docker build -t data-scrape .
docker tag data-scrape:latest gcr.io/tobydrane-personal-site/data-scrape
docker push gcr.io/tobydrane-personal-site/data-scrape