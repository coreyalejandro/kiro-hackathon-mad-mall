"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageConstruct = void 0;
const constructs_1 = require("constructs");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const aws_s3_1 = require("aws-cdk-lib/aws-s3");
const aws_kms_1 = require("aws-cdk-lib/aws-kms");
const aws_iam_1 = require("aws-cdk-lib/aws-iam");
const aws_cloudfront_1 = require("aws-cdk-lib/aws-cloudfront");
const aws_cloudfront_origins_1 = require("aws-cdk-lib/aws-cloudfront-origins");
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
        // Create CloudFront Origin Access Identity
        this.originAccessIdentity = new aws_cloudfront_1.OriginAccessIdentity(this, 'ContentOAI', {
            comment: `OAI for MADMall ${environment} user content bucket`,
        });
        // Grant CloudFront access to S3 bucket
        this.userContentBucket.addToResourcePolicy(new aws_iam_1.PolicyStatement({
            effect: aws_iam_1.Effect.ALLOW,
            principals: [this.originAccessIdentity.grantPrincipal],
            actions: ['s3:GetObject'],
            resources: [`${this.userContentBucket.bucketArn}/*`],
        }));
        // Create CloudFront distribution for image CDN
        this.cdnDistribution = new aws_cloudfront_1.Distribution(this, 'ContentCDN', {
            comment: `MADMall ${environment} Content CDN`,
            defaultBehavior: {
                origin: new aws_cloudfront_origins_1.S3Origin(this.userContentBucket, {
                    originAccessIdentity: this.originAccessIdentity,
                }),
                viewerProtocolPolicy: aws_cloudfront_1.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
                cachePolicy: aws_cloudfront_1.CachePolicy.CACHING_OPTIMIZED,
                originRequestPolicy: aws_cloudfront_1.OriginRequestPolicy.CORS_S3_ORIGIN,
                responseHeadersPolicy: aws_cloudfront_1.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
            },
            priceClass: environment === 'prod' ? aws_cloudfront_1.PriceClass.PRICE_CLASS_ALL : aws_cloudfront_1.PriceClass.PRICE_CLASS_100,
            enableIpv6: true,
        });
        aws_cdk_lib_1.Tags.of(this.cdnDistribution).add('Name', `madmall-${environment}-content-cdn`);
        aws_cdk_lib_1.Tags.of(this.cdnDistribution).add('Environment', environment);
    }
}
exports.StorageConstruct = StorageConstruct;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic3RvcmFnZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL2luZnJhc3RydWN0dXJlL3NyYy9jb25zdHJ1Y3RzL3N0b3JhZ2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsMkNBQXVDO0FBQ3ZDLDZDQUFtRTtBQUNuRSwrQ0FBaUY7QUFDakYsaURBQTZEO0FBQzdELGlEQUEwSDtBQUMxSCwrREFRb0M7QUFDcEMsK0VBQThEO0FBUzlELE1BQWEsZ0JBQWlCLFNBQVEsc0JBQVM7SUFNOUMsWUFBWSxLQUFnQixFQUFFLEVBQVUsRUFBRSxLQUE0QjtRQUNyRSxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBRWpCLE1BQU0sRUFBRSxXQUFXLEVBQUUsaUJBQWlCLEVBQUUsR0FBRyxLQUFLLENBQUM7UUFFakQsa0NBQWtDO1FBQ2xDLElBQUksQ0FBQyxhQUFhLEdBQUcsSUFBSSxhQUFHLENBQUMsSUFBSSxFQUFFLGVBQWUsRUFBRTtZQUNuRCxXQUFXLEVBQUUsV0FBVyxXQUFXLDhCQUE4QjtZQUNqRSxpQkFBaUIsRUFBRSxJQUFJO1lBQ3ZCLFFBQVEsRUFBRSxrQkFBUSxDQUFDLGVBQWU7WUFDbEMsT0FBTyxFQUFFLGlCQUFPLENBQUMsaUJBQWlCO1lBQ2xDLGFBQWEsRUFBRSxXQUFXLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQywyQkFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsMkJBQWEsQ0FBQyxPQUFPO1NBQ3BGLENBQUMsQ0FBQztRQUVILGtCQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFdBQVcsV0FBVyxjQUFjLENBQUMsQ0FBQztRQUM5RSxrQkFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztRQUU1RCx1Q0FBdUM7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K0NBQStDO1FBQy9DLElBQUksQ0FBQyxlQUFlLEdBQUcsSUFBSSw2QkFBWSxDQUFDLElBQUksRUFBRSxZQUFZLEVBQUU7WUFDM0QsT0FBTyxFQUFFLFdBQVcsV0FBVyxjQUFjO1lBQzdDLGVBQWUsRUFBRTtnQkFDaEIsTUFBTSxFQUFFLElBQUksaUNBQVEsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLEVBQUU7b0JBQzVDLG9CQUFvQixFQUFFLElBQUksQ0FBQyxvQkFBb0I7aUJBQy9DLENBQUM7Z0JBQ0Ysb0JBQW9CLEVBQUUscUNBQW9CLENBQUMsaUJBQWlCO2dCQUM1RCxXQUFXLEVBQUUsNEJBQVcsQ0FBQyxpQkFBaUI7Z0JBQzFDLG1CQUFtQixFQUFFLG9DQUFtQixDQUFDLGNBQWM7Z0JBQ3ZELHFCQUFxQixFQUFFLHNDQUFxQixDQUFDLHNCQUFzQjthQUNuRTtZQUNELFVBQVUsRUFBRSxXQUFXLEtBQUssTUFBTSxDQUFDLENBQUMsQ0FBQywyQkFBVSxDQUFDLGVBQWUsQ0FBQyxDQUFDLENBQUMsMkJBQVUsQ0FBQyxlQUFlO1lBQzVGLFVBQVUsRUFBRSxJQUFJO1NBQ2hCLENBQUMsQ0FBQztRQUVILGtCQUFJLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxFQUFFLFdBQVcsV0FBVyxjQUFjLENBQUMsQ0FBQztRQUNoRixrQkFBSSxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsZUFBZSxDQUFDLENBQUMsR0FBRyxDQUFDLGFBQWEsRUFBRSxXQUFXLENBQUMsQ0FBQztJQUMvRCxDQUFDO0NBQ0Q7QUF6R0QsNENBeUdDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHsgQ29uc3RydWN0IH0gZnJvbSAnY29uc3RydWN0cyc7XG5pbXBvcnQgeyBSZW1vdmFsUG9saWN5LCBTdGFjaywgVGFncywgRHVyYXRpb24gfSBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgeyBCdWNrZXQsIEJsb2NrUHVibGljQWNjZXNzLCBCdWNrZXRFbmNyeXB0aW9uIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLXMzJztcbmltcG9ydCB7IEtleSwgS2V5U3BlYywgS2V5VXNhZ2UgfSBmcm9tICdhd3MtY2RrLWxpYi9hd3Mta21zJztcbmltcG9ydCB7IFJvbGUsIFBvbGljeVN0YXRlbWVudCwgRWZmZWN0LCBTZXJ2aWNlUHJpbmNpcGFsLCBBY2NvdW50Um9vdFByaW5jaXBhbCwgQXJuUHJpbmNpcGFsIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgeyBcbiAgRGlzdHJpYnV0aW9uLCBcbiAgT3JpZ2luQWNjZXNzSWRlbnRpdHksIFxuICBWaWV3ZXJQcm90b2NvbFBvbGljeSwgXG4gIENhY2hlUG9saWN5LCBcbiAgT3JpZ2luUmVxdWVzdFBvbGljeSxcbiAgUmVzcG9uc2VIZWFkZXJzUG9saWN5LFxuICBQcmljZUNsYXNzXG59IGZyb20gJ2F3cy1jZGstbGliL2F3cy1jbG91ZGZyb250JztcbmltcG9ydCB7IFMzT3JpZ2luIH0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWNsb3VkZnJvbnQtb3JpZ2lucyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgU3RvcmFnZUNvbnN0cnVjdFByb3BzIHtcblx0LyoqIEVudmlyb25tZW50IG5hbWUgKGRldiwgc3RhZ2luZywgcHJvZCkgKi9cblx0ZW52aXJvbm1lbnQ6IHN0cmluZztcblx0LyoqIEF1dGhlbnRpY2F0ZWQgQ29nbml0byByb2xlIHJlcXVpcmluZyBTMyBhY2Nlc3MgdG8gcGVyLXVzZXIgcHJlZml4ZXMgKi9cblx0YXV0aGVudGljYXRlZFJvbGU6IFJvbGU7XG59XG5cbmV4cG9ydCBjbGFzcyBTdG9yYWdlQ29uc3RydWN0IGV4dGVuZHMgQ29uc3RydWN0IHtcblx0cHVibGljIHJlYWRvbmx5IGNvbnRlbnRLbXNLZXk6IEtleTtcblx0cHVibGljIHJlYWRvbmx5IHVzZXJDb250ZW50QnVja2V0OiBCdWNrZXQ7XG5cdHB1YmxpYyByZWFkb25seSBjZG5EaXN0cmlidXRpb246IERpc3RyaWJ1dGlvbjtcblx0cHVibGljIHJlYWRvbmx5IG9yaWdpbkFjY2Vzc0lkZW50aXR5OiBPcmlnaW5BY2Nlc3NJZGVudGl0eTtcblxuXHRjb25zdHJ1Y3RvcihzY29wZTogQ29uc3RydWN0LCBpZDogc3RyaW5nLCBwcm9wczogU3RvcmFnZUNvbnN0cnVjdFByb3BzKSB7XG5cdFx0c3VwZXIoc2NvcGUsIGlkKTtcblxuXHRcdGNvbnN0IHsgZW52aXJvbm1lbnQsIGF1dGhlbnRpY2F0ZWRSb2xlIH0gPSBwcm9wcztcblxuXHRcdC8vIEtNUyBrZXkgZm9yIHVzZXIgY29udGVudCBidWNrZXRcblx0XHR0aGlzLmNvbnRlbnRLbXNLZXkgPSBuZXcgS2V5KHRoaXMsICdDb250ZW50S21zS2V5Jywge1xuXHRcdFx0ZGVzY3JpcHRpb246IGBNQURNYWxsICR7ZW52aXJvbm1lbnR9IEtNUyBrZXkgZm9yIFMzIHVzZXIgY29udGVudGAsXG5cdFx0XHRlbmFibGVLZXlSb3RhdGlvbjogdHJ1ZSxcblx0XHRcdGtleVVzYWdlOiBLZXlVc2FnZS5FTkNSWVBUX0RFQ1JZUFQsXG5cdFx0XHRrZXlTcGVjOiBLZXlTcGVjLlNZTU1FVFJJQ19ERUZBVUxULFxuXHRcdFx0cmVtb3ZhbFBvbGljeTogZW52aXJvbm1lbnQgPT09ICdwcm9kJyA/IFJlbW92YWxQb2xpY3kuUkVUQUlOIDogUmVtb3ZhbFBvbGljeS5ERVNUUk9ZLFxuXHRcdH0pO1xuXG5cdFx0VGFncy5vZih0aGlzLmNvbnRlbnRLbXNLZXkpLmFkZCgnTmFtZScsIGBtYWRtYWxsLSR7ZW52aXJvbm1lbnR9LWNvbnRlbnQta2V5YCk7XG5cdFx0VGFncy5vZih0aGlzLmNvbnRlbnRLbXNLZXkpLmFkZCgnRW52aXJvbm1lbnQnLCBlbnZpcm9ubWVudCk7XG5cblx0XHQvLyBTMyBidWNrZXQgZm9yIHVzZXItZ2VuZXJhdGVkIGNvbnRlbnRcblx0XHR0aGlzLnVzZXJDb250ZW50QnVja2V0ID0gbmV3IEJ1Y2tldCh0aGlzLCAnVXNlckNvbnRlbnRCdWNrZXQnLCB7XG5cdFx0XHRidWNrZXROYW1lOiBgbWFkbWFsbC0ke2Vudmlyb25tZW50fS11c2VyLWNvbnRlbnRgLFxuXHRcdFx0YmxvY2tQdWJsaWNBY2Nlc3M6IEJsb2NrUHVibGljQWNjZXNzLkJMT0NLX0FMTCxcblx0XHRcdGVuZm9yY2VTU0w6IHRydWUsXG5cdFx0XHRlbmNyeXB0aW9uOiBCdWNrZXRFbmNyeXB0aW9uLktNUyxcblx0XHRcdGVuY3J5cHRpb25LZXk6IHRoaXMuY29udGVudEttc0tleSxcblx0XHRcdGJ1Y2tldEtleUVuYWJsZWQ6IHRydWUsXG5cdFx0XHR2ZXJzaW9uZWQ6IHRydWUsXG5cdFx0XHRyZW1vdmFsUG9saWN5OiBlbnZpcm9ubWVudCA9PT0gJ3Byb2QnID8gUmVtb3ZhbFBvbGljeS5SRVRBSU4gOiBSZW1vdmFsUG9saWN5LkRFU1RST1ksXG5cdFx0XHRhdXRvRGVsZXRlT2JqZWN0czogZW52aXJvbm1lbnQgIT09ICdwcm9kJyxcblx0XHR9KTtcblxuXHRcdFRhZ3Mub2YodGhpcy51c2VyQ29udGVudEJ1Y2tldCkuYWRkKCdOYW1lJywgYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tdXNlci1jb250ZW50YCk7XG5cdFx0VGFncy5vZih0aGlzLnVzZXJDb250ZW50QnVja2V0KS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuXG5cdFx0Ly8gRGVueSBub24tU1NMIGFjY2VzcyBleHBsaWNpdGx5IChiZWx0LWFuZC1zdXNwZW5kZXJzIGluIGFkZGl0aW9uIHRvIGVuZm9yY2VTU0wpXG5cdFx0dGhpcy51c2VyQ29udGVudEJ1Y2tldC5hZGRUb1Jlc291cmNlUG9saWN5KG5ldyBQb2xpY3lTdGF0ZW1lbnQoe1xuXHRcdFx0ZWZmZWN0OiBFZmZlY3QuREVOWSxcblx0XHRcdHByaW5jaXBhbHM6IFtuZXcgQWNjb3VudFJvb3RQcmluY2lwYWwoKSwgbmV3IEFyblByaW5jaXBhbCgnKicpXSxcblx0XHRcdGFjdGlvbnM6IFsnczM6KiddLFxuXHRcdFx0cmVzb3VyY2VzOiBbXG5cdFx0XHRcdHRoaXMudXNlckNvbnRlbnRCdWNrZXQuYnVja2V0QXJuLFxuXHRcdFx0XHRgJHt0aGlzLnVzZXJDb250ZW50QnVja2V0LmJ1Y2tldEFybn0vKmAsXG5cdFx0XHRdLFxuXHRcdFx0Y29uZGl0aW9uczogeyBCb29sOiB7ICdhd3M6U2VjdXJlVHJhbnNwb3J0JzogJ2ZhbHNlJyB9IH0sXG5cdFx0fSkpO1xuXG5cdFx0Ly8gQWxsb3cgdGhlIGF1dGhlbnRpY2F0ZWQgcm9sZSB0byBlbmNyeXB0L2RlY3J5cHQgdXNpbmcgdGhlIGJ1Y2tldCBLTVMga2V5XG5cdFx0dGhpcy5jb250ZW50S21zS2V5LmdyYW50RW5jcnlwdERlY3J5cHQoYXV0aGVudGljYXRlZFJvbGUpO1xuXG5cdFx0Ly8gT3B0aW9uYWw6IG5hcnJvdyBLTVMgdXNhZ2UgYnkgY29uZGl0aW9uIHRvIHRoaXMgYnVja2V0IHdoZW4gdXNlZCB2aWEgUzNcblx0XHR0aGlzLmNvbnRlbnRLbXNLZXkuYWRkVG9SZXNvdXJjZVBvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcblx0XHRcdGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuXHRcdFx0cHJpbmNpcGFsczogW2F1dGhlbnRpY2F0ZWRSb2xlXSxcblx0XHRcdGFjdGlvbnM6IFtcblx0XHRcdFx0J2ttczpFbmNyeXB0Jyxcblx0XHRcdFx0J2ttczpEZWNyeXB0Jyxcblx0XHRcdFx0J2ttczpSZUVuY3J5cHQqJyxcblx0XHRcdFx0J2ttczpHZW5lcmF0ZURhdGFLZXkqJyxcblx0XHRcdFx0J2ttczpEZXNjcmliZUtleScsXG5cdFx0XHRdLFxuXHRcdFx0cmVzb3VyY2VzOiBbJyonXSxcblx0XHRcdGNvbmRpdGlvbnM6IHtcblx0XHRcdFx0U3RyaW5nRXF1YWxzOiB7XG5cdFx0XHRcdFx0J2ttczpFbmNyeXB0aW9uQ29udGV4dDphd3M6czM6YXJuJzogdGhpcy51c2VyQ29udGVudEJ1Y2tldC5idWNrZXRBcm4sXG5cdFx0XHRcdH0sXG5cdFx0XHR9LFxuXHRcdH0pKTtcblxuXHRcdC8vIENyZWF0ZSBDbG91ZEZyb250IE9yaWdpbiBBY2Nlc3MgSWRlbnRpdHlcblx0XHR0aGlzLm9yaWdpbkFjY2Vzc0lkZW50aXR5ID0gbmV3IE9yaWdpbkFjY2Vzc0lkZW50aXR5KHRoaXMsICdDb250ZW50T0FJJywge1xuXHRcdFx0Y29tbWVudDogYE9BSSBmb3IgTUFETWFsbCAke2Vudmlyb25tZW50fSB1c2VyIGNvbnRlbnQgYnVja2V0YCxcblx0XHR9KTtcblxuXHRcdC8vIEdyYW50IENsb3VkRnJvbnQgYWNjZXNzIHRvIFMzIGJ1Y2tldFxuXHRcdHRoaXMudXNlckNvbnRlbnRCdWNrZXQuYWRkVG9SZXNvdXJjZVBvbGljeShuZXcgUG9saWN5U3RhdGVtZW50KHtcblx0XHRcdGVmZmVjdDogRWZmZWN0LkFMTE9XLFxuXHRcdFx0cHJpbmNpcGFsczogW3RoaXMub3JpZ2luQWNjZXNzSWRlbnRpdHkuZ3JhbnRQcmluY2lwYWxdLFxuXHRcdFx0YWN0aW9uczogWydzMzpHZXRPYmplY3QnXSxcblx0XHRcdHJlc291cmNlczogW2Ake3RoaXMudXNlckNvbnRlbnRCdWNrZXQuYnVja2V0QXJufS8qYF0sXG5cdFx0fSkpO1xuXG5cdFx0Ly8gQ3JlYXRlIENsb3VkRnJvbnQgZGlzdHJpYnV0aW9uIGZvciBpbWFnZSBDRE5cblx0XHR0aGlzLmNkbkRpc3RyaWJ1dGlvbiA9IG5ldyBEaXN0cmlidXRpb24odGhpcywgJ0NvbnRlbnRDRE4nLCB7XG5cdFx0XHRjb21tZW50OiBgTUFETWFsbCAke2Vudmlyb25tZW50fSBDb250ZW50IENETmAsXG5cdFx0XHRkZWZhdWx0QmVoYXZpb3I6IHtcblx0XHRcdFx0b3JpZ2luOiBuZXcgUzNPcmlnaW4odGhpcy51c2VyQ29udGVudEJ1Y2tldCwge1xuXHRcdFx0XHRcdG9yaWdpbkFjY2Vzc0lkZW50aXR5OiB0aGlzLm9yaWdpbkFjY2Vzc0lkZW50aXR5LFxuXHRcdFx0XHR9KSxcblx0XHRcdFx0dmlld2VyUHJvdG9jb2xQb2xpY3k6IFZpZXdlclByb3RvY29sUG9saWN5LlJFRElSRUNUX1RPX0hUVFBTLFxuXHRcdFx0XHRjYWNoZVBvbGljeTogQ2FjaGVQb2xpY3kuQ0FDSElOR19PUFRJTUlaRUQsXG5cdFx0XHRcdG9yaWdpblJlcXVlc3RQb2xpY3k6IE9yaWdpblJlcXVlc3RQb2xpY3kuQ09SU19TM19PUklHSU4sXG5cdFx0XHRcdHJlc3BvbnNlSGVhZGVyc1BvbGljeTogUmVzcG9uc2VIZWFkZXJzUG9saWN5LkNPUlNfQUxMT1dfQUxMX09SSUdJTlMsXG5cdFx0XHR9LFxuXHRcdFx0cHJpY2VDbGFzczogZW52aXJvbm1lbnQgPT09ICdwcm9kJyA/IFByaWNlQ2xhc3MuUFJJQ0VfQ0xBU1NfQUxMIDogUHJpY2VDbGFzcy5QUklDRV9DTEFTU18xMDAsXG5cdFx0XHRlbmFibGVJcHY2OiB0cnVlLFxuXHRcdH0pO1xuXG5cdFx0VGFncy5vZih0aGlzLmNkbkRpc3RyaWJ1dGlvbikuYWRkKCdOYW1lJywgYG1hZG1hbGwtJHtlbnZpcm9ubWVudH0tY29udGVudC1jZG5gKTtcblx0XHRUYWdzLm9mKHRoaXMuY2RuRGlzdHJpYnV0aW9uKS5hZGQoJ0Vudmlyb25tZW50JywgZW52aXJvbm1lbnQpO1xuXHR9XG59XG5cbiJdfQ==