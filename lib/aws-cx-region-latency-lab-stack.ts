import { Stack, StackProps } from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as autoscaling from 'aws-cdk-lib/aws-autoscaling';
import * as iam from 'aws-cdk-lib/aws-iam';
import { TextWidget } from 'aws-cdk-lib/aws-cloudwatch';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

interface AwsCxRegionLatencyLabStackProps extends StackProps {
  vpccidr?: string;
  remotecidr?: string;
}


export class AwsCxRegionLatencyLabStack extends Stack {
  constructor(scope: Construct, id: string, props?: AwsCxRegionLatencyLabStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'VPC', {
      cidr: props?.vpccidr,
      maxAzs: 3
    })

    const vpcPrivateSubnets = vpc.privateSubnets.slice(0,3).map(x => x.subnetId);

    

    const sg = new ec2.SecurityGroup(this, 'SG', {
      vpc
    })

    sg.addIngressRule(ec2.Peer.ipv4('10.0.0.0/8'), ec2.Port.allTraffic())

    const role = new iam.Role(this, 'Role', {
      assumedBy: new iam.ServicePrincipal('ec2.amazonaws.com')
    })

    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'))
    role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchAgentAdminPolicy'))
    


    const asg = new autoscaling.AutoScalingGroup(this, 'ASG', {
      vpc,
      instanceType: ec2.InstanceType.of(ec2.InstanceClass.COMPUTE5, ec2.InstanceSize.LARGE),
      machineImage: new ec2.AmazonLinuxImage({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2
      }),
      minCapacity: 3,
      maxCapacity: 6,
      securityGroup: sg,
      role: role
    })

    const tgw = new ec2.CfnTransitGateway(this, 'TGW')

    const cfnTransitGatewayAttachment = new ec2.CfnTransitGatewayAttachment(this, 'MyCfnTransitGatewayAttachment', {
      subnetIds: vpcPrivateSubnets,
      transitGatewayId: tgw.attrId,
      vpcId: vpc.vpcId,
    });

    vpc.privateSubnets.forEach(({ routeTable: { routeTableId } }, index) => {
      
      const route = new ec2.CfnRoute(this, 'PrivateSubnetTGWRoute' + index, {
        destinationCidrBlock: props?.remotecidr,
        routeTableId,
        transitGatewayId: tgw.attrId
      })
      route.node.addDependency(tgw)
    })

    

  }
}

