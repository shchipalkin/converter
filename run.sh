#!/bin/bash

PORT=7000 node bin/www --proxy=172.28.4.7:8080 >> /dev/null 2>&1>nohup.out &