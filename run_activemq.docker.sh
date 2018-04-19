#!/bin/bash
docker run --name='activemq' -it --rm \
-e 'ACTIVEMQ_CONFIG_MINMEMORY=1024' -e  'ACTIVEMQ_CONFIG_MAXMEMORY=4096' \
-p 8161:8161 \
-p 61616:61616 \
-p 61613:61613 \
webcenter/activemq:latest