"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageConstruct = void 0;
const constructs_1 = require("constructs");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
const aws_kms_1 = require("aws-cdk-lib/aws-kms");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
class StorageConstruct extends constructs_1.Construct {
    constructor(scope, id, props) {
        super(scope, id);
        const { environment, authenticatedRole } = props;
        // KMS key for user content bucket
        this.contentKmsKey = new aws_kms_1.Key(this, 'ContentKmsKey', {
            description: `MADMall ${environment} KMS key for S3 user content`,
            enableKeyRotation: true,
            keyUsage: aws_kms_1.KeyUsage.ENCRYPT_DECRYPT,
            keySpec: aws_kms_1.KeySpec.SYMMETRIC_DEFAULT,
            removalPolicy: environment === 'prod' ? aws_cdk_lib_1.RemovalPolicy.RETAIN : aws_cdk_lib_1.RemovalPolicy.DESTROY,
        });
        aws_cdk_lib_1.Tags.of(this.contentKmsKey).add('Name', `madmall-${environment}-content-key`);
        aws_cdk_lib_1.Tags.of(this.contentKmsKey).add('Environment', environment);
        // S3 bucket for user-generated content
        this.userContentBucket = new aws_s3_1.Bucket(this, 'UserContentBucket', {
            bucketName: `madmall-${environment}-user-content`,
            blockPublicAccess: aws_s3_1.BlockPublicAccess.BLOCK_ALL,
            enforceSSL: true,
            encryption: aws_s3_1.BucketEncryption.KMS,
            encryptionKey: this.contentKmsKey,
            bucketKeyEnabled: true,
            versioned: true,
            removalPolicy: environment === 'prod' ? aws_cdk_lib_1.RemovalPolicy.RETAIN : aws_cdk_lib_1.RemovalPolicy.DESTROY,
            autoDeleteObjects: environment !== 'prod',
        });
        aws_cdk_lib_1.Tags.of(this.userContentBucket).add('Name', `madmall-${environment}-user-content`);
        aws_cdk_lib_1.Tags.of(this.userContentBucket).add('Environment', environment);
        // Deny non-SSL access explicitly (belt-and-suspenders in addition to enforceSSL)
        this.userContentBucket.addToResourcePolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.DENY,
            principals: [new aws_iam_1.AccountRootPrincipal(), new aws_iam_1.ArnPrincipal('*')],
            actions: ['s3:*'],
            resources: [
                this.userContentBucket.bucketArn,
                `${this.userContentBucket.bucketArn}/*`,
            ],
            conditions: { Bool: { 'aws:SecureTransport': 'false' } },
        }));
        // Allow the authenticated role to encrypt/decrypt using the bucket KMS key
        this.contentKmsKey.grantEncryptDecrypt(authenticatedRole);
        // Optional: narrow KMS usage by condition to this bucket when used via S3
        this.contentKmsKey.addToResourcePolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            principals: [authenticatedRole],
            actions: [
                'kms:Encrypt',
                'kms:Decrypt',
                'kms:ReEncrypt*',
                'kms:GenerateDataKey*',
                'kms:DescribeKey',
            ],
            resources: ['*'],
            conditions: {
                StringEquals: {
                    'kms:EncryptionContext:aws:s3:arn': this.userContentBucket.bucketArn,
                },
            },
        }));
    }
}
exports.StorageConstruct = StorageConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9jb25zdHJ1Y3RzL3N0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQXVDO0FBQ3ZDLDZDQUF5RDtBQUN6RCwrQ0FBaUY7QUFDakYsaURBQTZEO0FBQzdELGlEQUEwSDtBQVMxSCxNQUFhLGdCQUFpQixTQUFRLHNCQUFTO0lBSTlDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBNEI7UUFDckUsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVqQixNQUFNLEVBQUUsV0FBVyxFQUFFLGlCQUFpQixFQUFFLEdBQUcsS0FBSyxDQUFDO1FBRWpELGtDQUFrQztRQUNsQyxJQUFJLENBQUMsYUFBYSxHQUFHLElBQUksYUFBRyxDQUFDLElBQUksRUFBRSxlQUFlLEVBQUU7WUFDbkQsV0FBVyxFQUFFLFdBQVcsV0FBVyw4QkFBOEI7WUFDakUsaUJBQWlCLEVBQUUsSUFBSTtZQUN2QixRQUFRLEVBQUUsa0JBQVEsQ0FBQyxlQUFlO1lBQ2xDLE9BQU8sRUFBRSxpQkFBTyxDQUFDLGlCQUFpQjtZQUNsQyxhQUFhLEVBQUUsV0FBVyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsMkJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLDJCQUFhLENBQUMsT0FBTztTQUNwRixDQUFDLENBQUM7UUFFSCxrQkFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxXQUFXLFdBQVcsY0FBYyxDQUFDLENBQUM7UUFDOUUsa0JBQUksQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxhQUFhLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFFNUQsdUNBQXVDO1FBQ3ZDLElBQUksQ0FBQyxpQkFBaUIsR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDOUQsVUFBVSxFQUFFLFdBQVcsV0FBVyxlQUFlO1lBQ2pELGlCQUFpQixFQUFFLDBCQUFpQixDQUFDLFNBQVM7WUFDOUMsVUFBVSxFQUFFLElBQUk7WUFDaEIsVUFBVSxFQUFFLHlCQUFnQixDQUFDLEdBQUc7WUFDaEMsYUFBYSxFQUFFLElBQUksQ0FBQyxhQUFhO1lBQ2pDLGdCQUFnQixFQUFFLElBQUk7WUFDdEIsU0FBUyxFQUFFLElBQUk7WUFDZixhQUFhLEVBQUUsV0FBVyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsMkJBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLDJCQUFhLENBQUMsT0FBTztZQUNwRixpQkFBaUIsRUFBRSxXQUFXLEtBQUssTUFBTTtTQUN6QyxDQUFDLENBQUM7UUFFSCxrQkFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFdBQVcsV0FBVyxlQUFlLENBQUMsQ0FBQztRQUNuRixrQkFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxHQUFHLENBQUMsYUFBYSxFQUFFLFdBQVcsQ0FBQyxDQUFDO1FBRWhFLGlGQUFpRjtRQUNqRixJQUFJLENBQUMsaUJBQWlCLENBQUMsbUJBQW1CLENBQUMsSUFBSSx5QkFBZSxDQUFDO1lBQzlELE1BQU0sRUFBRSxnQkFBTSxDQUFDLElBQUk7WUFDbkIsVUFBVSxFQUFFLENBQUMsSUFBSSw4QkFBb0IsRUFBRSxFQUFFLElBQUksc0JBQVksQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUMvRCxPQUFPLEVBQUUsQ0FBQyxNQUFNLENBQUM7WUFDakIsU0FBUyxFQUFFO2dCQUNWLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTO2dCQUNoQyxHQUFHLElBQUksQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLElBQUk7YUFDdkM7WUFDRCxVQUFVLEVBQUUsRUFBRSxJQUFJLEVBQUUsRUFBRSxxQkFBcUIsRUFBRSxPQUFPLEVBQUUsRUFBRTtTQUN4RCxDQUFDLENBQUMsQ0FBQztRQUVKLDJFQUEyRTtRQUMzRSxJQUFJLENBQUMsYUFBYSxDQUFDLG1CQUFtQixDQUFDLGlCQUFpQixDQUFDLENBQUM7UUFFMUQsMEVBQTBFO1FBQzFFLElBQUksQ0FBQyxhQUFhLENBQUMsbUJBQW1CLENBQUMsSUFBSSx5QkFBZSxDQUFDO1lBQzFELE1BQU0sRUFBRSxnQkFBTSxDQUFDLEtBQUs7WUFDcEIsVUFBVSxFQUFFLENBQUMsaUJBQWlCLENBQUM7WUFDL0IsT0FBTyxFQUFFO2dCQUNSLGFBQWE7Z0JBQ2IsYUFBYTtnQkFDYixnQkFBZ0I7Z0JBQ2hCLHNCQUFzQjtnQkFDdEIsaUJBQWlCO2FBQ2pCO1lBQ0QsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO1lBQ2hCLFVBQVUsRUFBRTtnQkFDWCxZQUFZLEVBQUU7b0JBQ2Isa0NBQWtDLEVBQUUsSUFBSSxDQUFDLGlCQUFpQixDQUFDLFNBQVM7aUJBQ3BFO2FBQ0Q7U0FDRCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7Q0FDRDtBQXZFRCw0Q0F1RUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcbmltcG9ydCB7IFJlbW92YWxQb2xpY3ksIFN0YWNrLCBUYWdzIH0gZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0IHsgQnVja2V0LCBCbG9ja1B1YmxpY0FjY2VzcywgQnVja2V0RW5jcnlwdGlvbiB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1zMyc7XG5pbXBvcnQgeyBLZXksIEtleVNwZWMsIEtleVVzYWdlIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWttcyc7XG5pbXBvcnQgeyBSb2xlLCBQb2xpY3lTdGF0ZW1lbnQsIEVmZmVjdCwgU2VydmljZVByaW5jaXBhbCwgQWNjb3VudFJvb3RQcmluY2lwYWwsIEFyblByaW5jaXBhbCB9IGZyb20gJ2F3cy1jZGstbGliL2F3cy1pYW0nO1xuXG5leHBvcnQgaW50ZXJmYWNlIFN0b3JhZ2VDb25zdHJ1Y3RQcm9wcyB7XG5cdC8qKiBFbnZpcm9ubWVudCBuYW1lIChkZXYsIHN0YWdpbmcsIHByb2QpICovXG5cdGVudmlyb25tZW50OiBzdHJpbmc7XG5cdC8qKiBBdXRoZW50aWNhdGVkIENvZ25pdG8gcm9sZSByZXF1aXJpbmcgUzMgYWNjZXNzIHRvIHBlci11c2VyIHByZWZpeGVzICovXG5cdGF1dGhlbnRpY2F0ZWRSb2xlOiBSb2xlO1xufVxuXG5leHBvcnQgY2xhc3MgU3RvcmFnZUNvbnN0cnVjdCBleHRlbmRzIENvbnN0cnVjdCB7XG5cdHB1YmxpYyByZWFkb25seSBjb250ZW50S21zS2V5OiBLZXk7XG5cdHB1YmxpYyByZWFkb25seSB1c2VyQ29udGVudEJ1Y2tldDogQnVja2V0O1xuXG5cdGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzOiBTdG9yYWdlQ29uc3RydWN0UHJvcHMpIHtcblx0XHRzdXBlcihzY29wZSwgaWQpO1xuXG5cdFx0Y29uc3QgeyBlbnZpcm9ubWVudCwgYXV0aGVudGljYXRlZFJvbGUgfSA9IHByb3BzO1xuXG5cdFx0Ly8gS01TIGtleSBmb3IgdXNlciBjb250ZW50IGJ1Y2tldFxuXHRcdHRoaXMuY29udGVudEttc0tleSA9IG5ldyBLZXkodGhpcywgJ0NvbnRlbnRLbXNLZXknLCB7XG5cdFx0XHRkZXNjcmlwdGlvbjogYE1BRE1hbGwgJHtlbnZpcm9ubWVudH0gS01TIGtleSBmb3IgUzMgdXNlciBjb250ZW50YCxcblx0XHRcdGVuYWJsZUtleVJvdGF0aW9uOiB0cnVlLFxuXHRcdFx0a2V5VXNhZ2U6IEtleVVzYWdlLkVOQ1JZUFRfREVDUllQVCxcblx0XHRcdGtleVNwZWM6IEtleVNwZWMuU1lNTUVUUklDX0RFRkFVTFQsXG5cdFx0XHRyZW1vdmFsUG9saWN5OiBlbnZpcm9ubWVudCA9PT0gJ3Byb2QnID8gUmVtb3ZhbFBvbGljeS5SRVRBSU4gOiBSZW1vdmFsUG9saWN5LkRFU1RST1ksXG5cdFx0fSk7XG5cblx0XHRUYWdzLm9mKHRoaXMuY29udGVudEttc0tleSkuYWRkKCdOYW1lJywgYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tY29udGVudC1rZXlgKTtcblx0XHRUYWdzLm9mKHRoaXMuY29udGVudEttc0tleSkuYWRkKCdFbnZpcm9ubWVudCcsIGVudmlyb25tZW50KTtcblxuXHRcdC8vIFMzIGJ1Y2tldCBmb3IgdXNlci1nZW5lcmF0ZWQgY29udGVudFxuXHRcdHRoaXMudXNlckNvbnRlbnRCdWNrZXQgPSBuZXcgQnVja2V0KHRoaXMsICdVc2VyQ29udGVudEJ1Y2tldCcsIHtcblx0XHRcdGJ1Y2tldE5hbWU6IGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LXVzZXItY29udGVudGAsXG5cdFx0XHRibG9ja1B1YmxpY0FjY2VzczogQmxvY2tQdWJsaWNBY2Nlc3MuQkxPQ0tfQUxMLFxuXHRcdFx0ZW5mb3JjZVNTTDogdHJ1ZSxcblx0XHRcdGVuY3J5cHRpb246IEJ1Y2tldEVuY3J5cHRpb24uS01TLFxuXHRcdFx0ZW5jcnlwdGlvbktleTogdGhpcy5jb250ZW50S21zS2V5LFxuXHRcdFx0YnVja2V0S2V5RW5hYmxlZDogdHJ1ZSxcblx0XHRcdHZlcnNpb25lZDogdHJ1ZSxcblx0XHRcdHJlbW92YWxQb2xpY3k6IGVudmlyb25tZW50ID09PSAncHJvZCcgPyBSZW1vdmFsUG9saWN5LlJFVEFJTiA6IFJlbW92YWxQb2xpY3kuREVTVFJPWSxcblx0XHRcdGF1dG9EZWxldGVPYmplY3RzOiBlbnZpcm9ubWVudCAhPT0gJ3Byb2QnLFxuXHRcdH0pO1xuXG5cdFx0VGFncy5vZih0aGlzLnVzZXJDb250ZW50QnVja2V0KS5hZGQoJ05hbWUnLCBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS11c2VyLWNvbnRlbnRgKTtcblx0XHRUYWdzLm9mKHRoaXMudXNlckNvbnRlbnRCdWNrZXQpLmFkZCgnRW52aXJvbm1lbnQnLCBlbnZpcm9ubWVudCk7XG5cblx0XHQvLyBEZW55IG5vbi1TU0wgYWNjZXNzIGV4cGxpY2l0bHkgKGJlbHQtYW5kLXN1c3BlbmRlcnMgaW4gYWRkaXRpb24gdG8gZW5mb3JjZVNTTClcblx0XHR0aGlzLnVzZXJDb250ZW50QnVja2V0LmFkZFRvUmVzb3VyY2VQb2xpY3kobmV3IFBvbGljeVN0YXRlbWVudCh7XG5cdFx0XHRlZmZlY3Q6IEVmZmVjdC5ERU5ZLFxuXHRcdFx0cHJpbmNpcGFsczogW25ldyBBY2NvdW50Um9vdFByaW5jaXBhbCgpLCBuZXcgQXJuUHJpbmNpcGFsKCcqJyldLFxuXHRcdFx0YWN0aW9uczogWydzMzoqJ10sXG5cdFx0XHRyZXNvdXJjZXM6IFtcblx0XHRcdFx0dGhpcy51c2VyQ29udGVudEJ1Y2tldC5idWNrZXRBcm4sXG5cdFx0XHRcdGAke3RoaXMudXNlckNvbnRlbnRCdWNrZXQuYnVja2V0QXJufS8qYCxcblx0XHRcdF0sXG5cdFx0XHRjb25kaXRpb25zOiB7IEJvb2w6IHsgJ2F3czpTZWN1cmVUcmFuc3BvcnQnOiAnZmFsc2UnIH0gfSxcblx0XHR9KSk7XG5cblx0XHQvLyBBbGxvdyB0aGUgYXV0aGVudGljYXRlZCByb2xlIHRvIGVuY3J5cHQvZGVjcnlwdCB1c2luZyB0aGUgYnVja2V0IEtNUyBrZXlcblx0XHR0aGlzLmNvbnRlbnRLbXNLZXkuZ3JhbnRFbmNyeXB0RGVjcnlwdChhdXRoZW50aWNhdGVkUm9sZSk7XG5cblx0XHQvLyBPcHRpb25hbDogbmFycm93IEtNUyB1c2FnZSBieSBjb25kaXRpb24gdG8gdGhpcyBidWNrZXQgd2hlbiB1c2VkIHZpYSBTM1xuXHRcdHRoaXMuY29udGVudEttc0tleS5hZGRUb1Jlc291cmNlUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuXHRcdFx0ZWZmZWN0OiBFZmZlY3QuQUxMT1csXG5cdFx0XHRwcmluY2lwYWxzOiBbYXV0aGVudGljYXRlZFJvbGVdLFxuXHRcdFx0YWN0aW9uczogW1xuXHRcdFx0XHQna21zOkVuY3J5cHQnLFxuXHRcdFx0XHQna21zOkRlY3J5cHQnLFxuXHRcdFx0XHQna21zOlJlRW5jcnlwdConLFxuXHRcdFx0XHQna21zOkdlbmVyYXRlRGF0YUtleSonLFxuXHRcdFx0XHQna21zOkRlc2NyaWJlS2V5Jyxcblx0XHRcdF0sXG5cdFx0XHRyZXNvdXJjZXM6IFsnKiddLFxuXHRcdFx0Y29uZGl0aW9uczoge1xuXHRcdFx0XHRTdHJpbmdFcXVhbHM6IHtcblx0XHRcdFx0XHQna21zOkVuY3J5cHRpb25Db250ZXh0OmF3czpzMzphcm4nOiB0aGlzLnVzZXJDb250ZW50QnVja2V0LmJ1Y2tldEFybixcblx0XHRcdFx0fSxcblx0XHRcdH0sXG5cdFx0fSkpO1xuXHR9XG59XG5cbiJdfQ==