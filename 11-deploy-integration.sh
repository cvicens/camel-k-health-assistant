#!/bin/bash

# Environment
. ./00-environment.sh

# Deploy integrations
./kamel run -d camel-http4 -d camel-kafka -d camel-gson -d \
  mvn:ca.uhn.hapi:hapi-base:2.3 -d mvn:ca.uhn.hapi:hapi-structures-v24:2.3 -d camel-hl7 \
  -p kafka.bootstrap-servers=his-cluster-kafka-brokers:9092 \
  -p kafka.topic=hl7-events-topic -p kafka.clientId=kafkaClientHisToBot \
  -p kafka.groupId=kafkaHisToBotConsumerGroup \
  -p telegram-bot.host=telegram-bot -p telegram-bot.port=8080 -p logging.level.org.apache.camel=INFO ./integrations/HisToBot.java
