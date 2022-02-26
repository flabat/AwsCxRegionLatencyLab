#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { AwsCxRegionLatencyLabStack } from '../lib/aws-cx-region-latency-lab-stack';

const app = new cdk.App();
new AwsCxRegionLatencyLabStack(app, 'AwsCxRegionLatencyLabStackUSE1', {
  env: { region: 'us-east-1', account: '528813035945' },
  vpccidr: '10.20.0.0/16',
  remotecidr: '10.40.0.0/16'

});

new AwsCxRegionLatencyLabStack(app, 'AwsCxRegionLatencyLabStackUSW2', {
  env: { region: 'us-west-2', account: '528813035945' },
  vpccidr: '10.40.0.0/16',
  remotecidr: '10.20.0.0/16'

});



