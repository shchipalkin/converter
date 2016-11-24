#!/bin/bash

HTTP_PROXY=127.0.0.1 HTTPS_PROXY=127.0.0.1 PORT=7000 node bin/www --bounds=7000:7010 --proxy=127.0.0.1:8080 >> /dev/null 2>&1 &